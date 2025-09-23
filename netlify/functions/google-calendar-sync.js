// Google Calendar integration for automatic appointment scheduling
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { appointmentId, action = 'create' } = JSON.parse(event.body);

    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointment details
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        leads (
          id, name, email, phone, company
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      throw new Error(`Appointment not found: ${appointmentId}`);
    }

    // Initialize Google Calendar API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
      },
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    const calendar = google.calendar({ version: 'v3', auth });

    if (action === 'create') {
      // Create calendar event
      const event = {
        summary: appointment.title,
        description: `${appointment.description}\n\nClient: ${appointment.leads.name}\nEmail: ${appointment.leads.email}\nPhone: ${appointment.leads.phone}${appointment.leads.company ? `\nCompany: ${appointment.leads.company}` : ''}`,
        start: {
          dateTime: appointment.start_time,
          timeZone: 'America/New_York', // Adjust for your timezone
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: 'America/New_York',
        },
        location: appointment.location,
        attendees: [
          { email: appointment.leads.email, displayName: appointment.leads.name }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours
            { method: 'email', minutes: 2 * 60 },  // 2 hours
            { method: 'popup', minutes: 30 },      // 30 minutes
          ],
        },
        colorId: '2', // Green color for appointments
      };

      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
        sendUpdates: 'all' // Send invites to attendees
      });

      // Update appointment with Google Calendar event ID
      await supabase
        .from('appointments')
        .update({ google_calendar_event_id: response.data.id })
        .eq('id', appointmentId);

      // Log activity
      await supabase
        .from('lead_activities')
        .insert([{
          lead_id: appointment.lead_id,
          activity_type: 'note',
          title: 'Google Calendar event created',
          description: `Calendar appointment created and invite sent to ${appointment.leads.email}`,
          metadata: {
            google_event_id: response.data.id,
            calendar_link: response.data.htmlLink,
            appointment_id: appointmentId
          }
        }]);

      console.log(`Google Calendar event created: ${response.data.id}`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Google Calendar event created successfully',
          eventId: response.data.id,
          eventLink: response.data.htmlLink,
          success: true
        })
      };

    } else if (action === 'update') {
      // Update existing calendar event
      if (!appointment.google_calendar_event_id) {
        throw new Error('No Google Calendar event ID found for this appointment');
      }

      const event = {
        summary: appointment.title,
        description: `${appointment.description}\n\nClient: ${appointment.leads.name}\nEmail: ${appointment.leads.email}\nPhone: ${appointment.leads.phone}${appointment.leads.company ? `\nCompany: ${appointment.leads.company}` : ''}`,
        start: {
          dateTime: appointment.start_time,
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: 'America/New_York',
        },
        location: appointment.location,
        status: appointment.status === 'cancelled' ? 'cancelled' : 'confirmed'
      };

      await calendar.events.update({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: appointment.google_calendar_event_id,
        resource: event,
        sendUpdates: 'all'
      });

      console.log(`Google Calendar event updated: ${appointment.google_calendar_event_id}`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Google Calendar event updated successfully',
          eventId: appointment.google_calendar_event_id,
          success: true
        })
      };

    } else if (action === 'delete') {
      // Cancel/delete calendar event
      if (!appointment.google_calendar_event_id) {
        throw new Error('No Google Calendar event ID found for this appointment');
      }

      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: appointment.google_calendar_event_id,
        sendUpdates: 'all'
      });

      // Clear the Google Calendar event ID
      await supabase
        .from('appointments')
        .update({ google_calendar_event_id: null })
        .eq('id', appointmentId);

      console.log(`Google Calendar event deleted: ${appointment.google_calendar_event_id}`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Google Calendar event deleted successfully',
          success: true
        })
      };
    }

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to sync with Google Calendar',
        error: error.message,
        success: false
      })
    };
  }
};

// Helper function to format calendar event for different appointment types
function getEventDetails(appointment) {
  const typeConfig = {
    'consultation': { color: '2', duration: 30 },
    'property-viewing': { color: '3', duration: 45 },
    'portfolio-review': { color: '4', duration: 60 },
    'market-analysis': { color: '5', duration: 45 }
  };

  const config = typeConfig[appointment.type] || { color: '2', duration: 30 };

  return {
    colorId: config.color,
    duration: config.duration
  };
}