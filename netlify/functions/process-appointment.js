// Process appointment bookings and create both lead and appointment in CRM
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse appointment data
    const appointmentData = JSON.parse(event.body);
    const {
      name,
      email,
      phone,
      company,
      appointment_type,
      appointment_date,
      appointment_time,
      property_id,
      property_title,
      message,
      source = 'calendar_booking'
    } = appointmentData;

    // Validate required fields
    if (!name || !email || !phone || !appointment_type || !appointment_date || !appointment_time) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required appointment information' })
      };
    }

    console.log(`Processing appointment booking for ${name} (${email}) on ${appointment_date} at ${appointment_time}`);

    // Get appointment type details
    const appointmentTypes = {
      'consultation': { label: 'Initial Consultation', duration: 30 },
      'property-viewing': { label: 'Property Viewing', duration: 45 },
      'portfolio-review': { label: 'Portfolio Review', duration: 60 },
      'market-analysis': { label: 'Market Analysis', duration: 45 }
    };

    const typeInfo = appointmentTypes[appointment_type] || { label: 'Consultation', duration: 30 };

    // Create lead first
    const leadTitle = `${typeInfo.label} - ${name}${company ? ` (${company})` : ''}`;
    const leadData = {
      title: leadTitle,
      type: 'consultation',
      status: 'new',
      priority: 'high', // Appointments are high priority
      name: name,
      email: email,
      phone: phone,
      company: company || null,
      property_interest: property_title || null,
      space_requirements: property_title ? `Interested in viewing: ${property_title}` : null,
      budget: null,
      timeline: 'Immediate - Appointment scheduled',
      message: message || null,
      source: source,
      consultation_date: appointment_date,
      consultation_time: appointment_time,
      follow_up_date: appointment_date, // Set follow-up for appointment date
      internal_notes: `Appointment booked via calendar widget. Type: ${typeInfo.label}, Duration: ${typeInfo.duration} minutes`
    };

    // Insert lead into Supabase
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (leadError) {
      console.error('Supabase lead creation error:', leadError);
      throw new Error(`Failed to create lead: ${leadError.message}`);
    }

    console.log(`Lead created in CRM with ID: ${newLead.id}`);

    // Create appointment
    const appointmentDateTime = new Date(`${appointment_date}T${convertToTimeString(appointment_time)}`);
    const endDateTime = new Date(appointmentDateTime.getTime() + (typeInfo.duration * 60 * 1000));

    const appointmentRecord = {
      lead_id: newLead.id,
      title: `${typeInfo.label} - ${name}`,
      description: `${typeInfo.label} appointment with ${name}${company ? ` from ${company}` : ''}${property_title ? ` regarding ${property_title}` : ''}`,
      start_time: appointmentDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: 'Office or Virtual (TBD)',
      attendees: [email],
      status: 'scheduled'
    };

    // Insert appointment into Supabase
    const { data: newAppointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointmentRecord])
      .select()
      .single();

    if (appointmentError) {
      console.error('Appointment creation error:', appointmentError);
      // Don't fail the whole process if appointment creation fails
    } else {
      console.log(`Appointment created with ID: ${newAppointment.id}`);
    }

    // Log initial activity
    const { error: activityError } = await supabase
      .from('lead_activities')
      .insert([{
        lead_id: newLead.id,
        activity_type: 'note',
        title: 'Appointment booked',
        description: `${typeInfo.label} appointment scheduled for ${appointment_date} at ${appointment_time}`,
        metadata: {
          source: source,
          appointment_type: appointment_type,
          appointment_date: appointment_date,
          appointment_time: appointment_time,
          duration: typeInfo.duration,
          property_id: property_id,
          appointment_id: newAppointment?.id
        }
      }]);

    if (activityError) {
      console.error('Activity log error:', activityError);
      // Don't fail the whole process for activity log errors
    }

    // Send lead notification to CRM (triggers admin email alert)
    try {
      const crmUrl = process.env.CRM_URL || 'https://sbaycrm.netlify.app';
      const crmNotificationResponse = await fetch(`${crmUrl}/api/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          company: company,
          property_interest: property_title || `${typeInfo.label} appointment`,
          message: message || `Appointment booking: ${typeInfo.label} on ${appointment_date} at ${appointment_time}`,
          source: 'appointment_booking',
          priority: 'high',
          type: 'consultation'
        })
      });

      if (crmNotificationResponse.ok) {
        console.log('CRM notification sent - admin will receive email alert');
      } else {
        console.error('CRM notification failed:', await crmNotificationResponse.text());
      }
    } catch (error) {
      console.error('CRM notification error:', error);
    }

    // Send confirmation emails and sync with Google Calendar
    const baseUrl = process.env.URL;
    if (baseUrl) {
      try {
        // Send confirmation emails
        const confirmationResponse = await fetch(`${baseUrl}/.netlify/functions/send-appointment-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentData,
            leadId: newLead.id,
            appointmentId: newAppointment?.id,
            appointmentDetails: {
              type: typeInfo.label,
              duration: typeInfo.duration,
              date: appointment_date,
              time: appointment_time
            }
          })
        });

        if (!confirmationResponse.ok) {
          console.error('Confirmation email failed:', await confirmationResponse.text());
        } else {
          console.log('Confirmation email sent successfully');
        }

        // Sync with Google Calendar
        if (newAppointment?.id) {
          const calendarResponse = await fetch(`${baseUrl}/.netlify/functions/google-calendar-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: newAppointment.id,
              action: 'create'
            })
          });

          if (!calendarResponse.ok) {
            console.error('Google Calendar sync failed:', await calendarResponse.text());
          } else {
            console.log('Google Calendar event created successfully');
          }
        }
      } catch (error) {
        console.error('Post-booking process error:', error);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        message: 'Appointment booked successfully',
        leadId: newLead.id,
        appointmentId: newAppointment?.id,
        success: true
      })
    };

  } catch (error) {
    console.error('Error processing appointment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
        success: false
      })
    };
  }
};

// Helper function to convert time string to ISO time format
function convertToTimeString(timeStr) {
  // Convert "9:00 AM" to "09:00:00"
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  hours = parseInt(hours);
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}