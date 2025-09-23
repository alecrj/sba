// Appointment rescheduling system with notifications
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { appointmentId, newDate, newTime, reason, requestedBy } = JSON.parse(event.body);

    // Validate required fields
    if (!appointmentId || !newDate || !newTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields: appointmentId, newDate, newTime' })
      };
    }

    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current appointment details
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        leads (
          id, name, email, phone, company
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (fetchError || !currentAppointment) {
      throw new Error(`Appointment not found: ${appointmentId}`);
    }

    console.log(`Rescheduling appointment ${appointmentId} from ${currentAppointment.start_time} to ${newDate} ${newTime}`);

    // Calculate new start and end times
    const newStartTime = new Date(`${newDate}T${convertToTimeString(newTime)}`);
    const currentDuration = new Date(currentAppointment.end_time) - new Date(currentAppointment.start_time);
    const newEndTime = new Date(newStartTime.getTime() + currentDuration);

    // Store original appointment details for notifications
    const originalStartTime = new Date(currentAppointment.start_time);
    const originalFormattedDate = originalStartTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const originalFormattedTime = originalStartTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Format new appointment details
    const newFormattedDate = newStartTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const newFormattedTime = newStartTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Update appointment in database
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
        status: 'scheduled', // Reset to scheduled
        reminder_24h_sent: false, // Reset reminders
        reminder_2h_sent: false
      })
      .eq('id', appointmentId);

    if (updateError) {
      throw new Error(`Failed to update appointment: ${updateError.message}`);
    }

    // Log activity
    await supabase
      .from('lead_activities')
      .insert([{
        lead_id: currentAppointment.lead_id,
        activity_type: 'note',
        title: 'Appointment rescheduled',
        description: `Appointment rescheduled from ${originalFormattedDate} at ${originalFormattedTime} to ${newFormattedDate} at ${newFormattedTime}${reason ? `. Reason: ${reason}` : ''}`,
        metadata: {
          appointment_id: appointmentId,
          original_date: currentAppointment.start_time,
          new_date: newStartTime.toISOString(),
          requested_by: requestedBy || 'system',
          reason: reason
        }
      }]);

    // Send rescheduling notifications
    await sendReschedulingNotifications({
      appointment: currentAppointment,
      originalDate: originalFormattedDate,
      originalTime: originalFormattedTime,
      newDate: newFormattedDate,
      newTime: newFormattedTime,
      reason,
      requestedBy
    });

    // Update Google Calendar if integrated
    const baseUrl = process.env.URL;
    if (baseUrl && currentAppointment.google_calendar_event_id) {
      try {
        await fetch(`${baseUrl}/.netlify/functions/google-calendar-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: appointmentId,
            action: 'update'
          })
        });
        console.log('Google Calendar event updated');
      } catch (error) {
        console.error('Failed to update Google Calendar:', error);
      }
    }

    console.log(`Appointment ${appointmentId} successfully rescheduled`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        message: 'Appointment rescheduled successfully',
        appointmentId,
        oldDateTime: currentAppointment.start_time,
        newDateTime: newStartTime.toISOString(),
        success: true
      })
    };

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to reschedule appointment',
        error: error.message,
        success: false
      })
    };
  }
};

// Helper function to send rescheduling notifications
async function sendReschedulingNotifications({ appointment, originalDate, originalTime, newDate, newTime, reason, requestedBy }) {
  try {
    const transporter = nodemailer.createTransporter({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const lead = appointment.leads;

    // Email to client (lead)
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📅 Appointment Rescheduled</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your appointment has been moved to a new date</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${lead.name},</p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
            Your appointment with Shallow Bay Advisors has been rescheduled. Here are the updated details:
          </p>

          <!-- Original Appointment (Crossed Out) -->
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; text-decoration: line-through; opacity: 0.7;">
            <h3 style="margin: 0 0 10px 0; color: #dc2626; font-size: 16px;">❌ Original Appointment (Cancelled)</h3>
            <div style="color: #dc2626;">
              <strong>Date:</strong> ${originalDate}<br>
              <strong>Time:</strong> ${originalTime}
            </div>
          </div>

          <!-- New Appointment Details -->
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">✅ New Appointment Details</h3>
            <div style="margin-bottom: 10px;"><strong>Title:</strong> ${appointment.title}</div>
            <div style="margin-bottom: 10px;"><strong>Date:</strong> ${newDate}</div>
            <div style="margin-bottom: 10px;"><strong>Time:</strong> ${newTime}</div>
            <div style="margin-bottom: 10px;"><strong>Location:</strong> ${appointment.location}</div>
          </div>

          ${reason ? `
          <div style="background: #fffbeb; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin: 0 0 5px 0; color: #92400e;">Reason for Rescheduling:</h4>
            <p style="margin: 0; color: #92400e;">${reason}</p>
          </div>
          ` : ''}

          <!-- Contact Information -->
          <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Questions or Need Changes?</h3>
            <div style="color: #065f46;">
              <strong>Phone:</strong> (954) 937-9667<br>
              <strong>Email:</strong> info@warehouselocating.com
            </div>
          </div>

          <p style="font-size: 16px; color: #374151; margin-top: 25px;">
            We apologize for any inconvenience and look forward to meeting with you at the new time!
          </p>

          <p style="margin-top: 20px; color: #374151;">
            Best regards,<br>
            <strong>The Shallow Bay Advisors Team</strong>
          </p>
        </div>
      </div>
    `;

    // Send email to client
    await transporter.sendMail({
      from: `"Shallow Bay Advisors" <${process.env.SMTP_USER}>`,
      to: lead.email,
      subject: `📅 Appointment Rescheduled - New Date: ${newDate}`,
      html: clientEmailHtml
    });

    // Email to business owner
    const ownerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">📅 Appointment Rescheduled</h2>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Client Information</h3>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ''}
        </div>

        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #dc2626;">Original Appointment (Cancelled)</h4>
          <p style="color: #dc2626;"><strong>Date:</strong> ${originalDate}</p>
          <p style="color: #dc2626;"><strong>Time:</strong> ${originalTime}</p>
        </div>

        <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1e40af;">New Appointment</h4>
          <p style="color: #1e40af;"><strong>Date:</strong> ${newDate}</p>
          <p style="color: #1e40af;"><strong>Time:</strong> ${newTime}</p>
          <p style="color: #1e40af;"><strong>Title:</strong> ${appointment.title}</p>
        </div>

        ${reason ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Reason:</h4>
          <p style="color: #92400e;">${reason}</p>
        </div>
        ` : ''}

        <p style="margin-top: 20px;">
          <strong>Requested by:</strong> ${requestedBy || 'System'}
        </p>
      </div>
    `;

    // Send email to business owner
    await transporter.sendMail({
      from: `"Shallow Bay Advisors CRM" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `📅 Appointment Rescheduled: ${lead.name} - ${newDate}`,
      html: ownerEmailHtml
    });

    console.log('Rescheduling notifications sent successfully');
  } catch (error) {
    console.error('Error sending rescheduling notifications:', error);
  }
}

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