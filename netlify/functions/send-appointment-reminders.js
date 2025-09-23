// Send appointment reminders (24-hour and 2-hour)
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
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for appointments that need reminders...');

    // Get current time
    const now = new Date();
    const in24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const in2Hours = new Date(now.getTime() + (2 * 60 * 60 * 1000));

    // Find appointments that need 24-hour reminders
    const { data: appointments24h, error: error24h } = await supabase
      .from('appointments')
      .select(`
        *,
        leads (
          id, name, email, phone, company
        )
      `)
      .eq('status', 'scheduled')
      .eq('reminder_24h_sent', false)
      .gte('start_time', now.toISOString())
      .lte('start_time', in24Hours.toISOString());

    if (error24h) {
      console.error('Error fetching 24-hour reminder appointments:', error24h);
    }

    // Find appointments that need 2-hour reminders
    const { data: appointments2h, error: error2h } = await supabase
      .from('appointments')
      .select(`
        *,
        leads (
          id, name, email, phone, company
        )
      `)
      .eq('status', 'scheduled')
      .eq('reminder_2h_sent', false)
      .gte('start_time', now.toISOString())
      .lte('start_time', in2Hours.toISOString());

    if (error2h) {
      console.error('Error fetching 2-hour reminder appointments:', error2h);
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransporter({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    let remindersSent = 0;

    // Send 24-hour reminders
    if (appointments24h && appointments24h.length > 0) {
      console.log(`Sending 24-hour reminders for ${appointments24h.length} appointments`);

      for (const appointment of appointments24h) {
        try {
          await sendReminder(transporter, appointment, '24 hours', supabase);
          remindersSent++;
        } catch (error) {
          console.error(`Failed to send 24-hour reminder for appointment ${appointment.id}:`, error);
        }
      }
    }

    // Send 2-hour reminders
    if (appointments2h && appointments2h.length > 0) {
      console.log(`Sending 2-hour reminders for ${appointments2h.length} appointments`);

      for (const appointment of appointments2h) {
        try {
          await sendReminder(transporter, appointment, '2 hours', supabase);
          remindersSent++;
        } catch (error) {
          console.error(`Failed to send 2-hour reminder for appointment ${appointment.id}:`, error);
        }
      }
    }

    console.log(`Successfully sent ${remindersSent} appointment reminders`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        message: `Successfully sent ${remindersSent} appointment reminders`,
        remindersSent,
        appointments24h: appointments24h?.length || 0,
        appointments2h: appointments2h?.length || 0,
        success: true
      })
    };

  } catch (error) {
    console.error('Error sending appointment reminders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to send appointment reminders',
        error: error.message,
        success: false
      })
    };
  }
};

// Helper function to send individual reminder
async function sendReminder(transporter, appointment, timeframe, supabase) {
  const lead = appointment.leads;
  if (!lead || !lead.email) {
    console.error(`No lead or email found for appointment ${appointment.id}`);
    return;
  }

  const startTime = new Date(appointment.start_time);
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const isUrgent = timeframe === '2 hours';
  const urgencyColor = isUrgent ? '#dc2626' : '#f59e0b';
  const urgencyBg = isUrgent ? '#fef2f2' : '#fffbeb';

  const reminderEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${isUrgent ? '#ef4444' : '#f59e0b'} 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
          ${isUrgent ? '⏰' : '📅'} Appointment Reminder
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
          Your appointment is in ${timeframe}
        </p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${lead.name},</p>

        <div style="background: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <p style="font-size: 18px; color: ${urgencyColor}; margin: 0; font-weight: bold;">
            ${isUrgent ? '🚨' : '⏰'} Your appointment is coming up in ${timeframe}!
          </p>
        </div>

        <!-- Appointment Details Box -->
        <div style="background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📅 Appointment Details</h3>
          <div style="margin-bottom: 10px;"><strong>Title:</strong> ${appointment.title}</div>
          <div style="margin-bottom: 10px;"><strong>Date:</strong> ${formattedDate}</div>
          <div style="margin-bottom: 10px;"><strong>Time:</strong> ${formattedTime}</div>
          <div style="margin-bottom: 10px;"><strong>Location:</strong> ${appointment.location || 'Shallow Bay Advisors Office'}</div>
          ${appointment.description ? `<div style="margin-bottom: 10px;"><strong>Description:</strong> ${appointment.description}</div>` : ''}
        </div>

        ${isUrgent ? `
        <!-- Urgent Actions -->
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #dc2626;">🚨 Last Minute Preparation</h3>
          <ul style="color: #dc2626; margin: 0; padding-left: 20px;">
            <li>Gather any documents or questions you have</li>
            <li>Confirm your transportation to our office</li>
            <li>Save our contact number: (954) 937-9667</li>
          </ul>
        </div>
        ` : `
        <!-- What to Bring -->
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #0369a1;">📋 What to Bring Tomorrow</h3>
          <ul style="color: #0369a1; margin: 0; padding-left: 20px;">
            <li>Any specific requirements or questions</li>
            <li>Information about your space needs</li>
            <li>Budget parameters (if comfortable sharing)</li>
            <li>Timeline for your move or expansion</li>
          </ul>
        </div>
        `}

        <!-- Contact Information -->
        <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Need to Make Changes?</h3>
          <p style="margin: 0; color: #065f46;">
            If you need to reschedule or have any questions:
          </p>
          <div style="margin-top: 10px; color: #065f46;">
            <strong>Phone:</strong> (954) 937-9667<br>
            <strong>Email:</strong> info@warehouselocating.com
          </div>
        </div>

        <p style="font-size: 16px; color: #374151; margin-top: 25px;">
          We're looking forward to meeting with you and helping you find the perfect commercial space!
        </p>

        <p style="margin-top: 20px; color: #374151;">
          Best regards,<br>
          <strong>The Shallow Bay Advisors Team</strong><br>
          <span style="color: #6b7280;">Your Commercial Real Estate Experts</span>
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
        <p>Shallow Bay Advisors | Commercial Real Estate Services</p>
        <p>This is an automated reminder email.</p>
      </div>
    </div>
  `;

  // Send reminder email
  await transporter.sendMail({
    from: `"Shallow Bay Advisors" <${process.env.SMTP_USER}>`,
    to: lead.email,
    subject: `${isUrgent ? '⏰ URGENT' : '📅'} Appointment Reminder - ${timeframe} until your meeting`,
    html: reminderEmailHtml
  });

  // Update appointment to mark reminder as sent
  const updateField = timeframe === '24 hours' ? 'reminder_24h_sent' : 'reminder_2h_sent';
  await supabase
    .from('appointments')
    .update({ [updateField]: true })
    .eq('id', appointment.id);

  // Log activity
  await supabase
    .from('lead_activities')
    .insert([{
      lead_id: appointment.lead_id,
      activity_type: 'email',
      title: `${timeframe} appointment reminder sent`,
      description: `Automated reminder email sent to ${lead.email} for appointment on ${formattedDate} at ${formattedTime}`,
      metadata: {
        reminder_type: timeframe,
        appointment_id: appointment.id,
        email_sent_to: lead.email
      }
    }]);

  console.log(`${timeframe} reminder sent to ${lead.email} for appointment ${appointment.id}`);
}