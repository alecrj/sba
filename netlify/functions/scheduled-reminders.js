// Scheduled function to automatically send appointment reminders
// This should be called periodically (e.g., every hour) by a cron job or external scheduler

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  try {
    console.log('🕐 Running scheduled appointment reminder check...');

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time
    const now = new Date();
    const in24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const in2Hours = new Date(now.getTime() + (2 * 60 * 60 * 1000));

    console.log(`Current time: ${now.toISOString()}`);
    console.log(`24-hour window: ${now.toISOString()} to ${in24Hours.toISOString()}`);
    console.log(`2-hour window: ${now.toISOString()} to ${in2Hours.toISOString()}`);

    // Find appointments that need 24-hour reminders (within 24-hour window but not within 2-hour window)
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
      .lte('start_time', in24Hours.toISOString())
      .gt('start_time', in2Hours.toISOString()); // Exclude appointments within 2 hours

    if (error24h) {
      console.error('Error fetching 24-hour reminder appointments:', error24h);
    } else {
      console.log(`Found ${appointments24h?.length || 0} appointments needing 24-hour reminders`);
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
    } else {
      console.log(`Found ${appointments2h?.length || 0} appointments needing 2-hour reminders`);
    }

    // If no reminders needed, return early
    if ((!appointments24h || appointments24h.length === 0) &&
        (!appointments2h || appointments2h.length === 0)) {
      console.log('✅ No reminders needed at this time');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No reminders needed',
          appointments24h: 0,
          appointments2h: 0,
          remindersSent: 0,
          success: true
        })
      };
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
      console.log(`📧 Sending 24-hour reminders for ${appointments24h.length} appointments`);

      for (const appointment of appointments24h) {
        try {
          await sendReminder(transporter, appointment, '24 hours', supabase);
          remindersSent++;
          console.log(`✅ 24-hour reminder sent for appointment ${appointment.id}`);
        } catch (error) {
          console.error(`❌ Failed to send 24-hour reminder for appointment ${appointment.id}:`, error);
        }
      }
    }

    // Send 2-hour reminders
    if (appointments2h && appointments2h.length > 0) {
      console.log(`📧 Sending 2-hour reminders for ${appointments2h.length} appointments`);

      for (const appointment of appointments2h) {
        try {
          await sendReminder(transporter, appointment, '2 hours', supabase);
          remindersSent++;
          console.log(`✅ 2-hour reminder sent for appointment ${appointment.id}`);
        } catch (error) {
          console.error(`❌ Failed to send 2-hour reminder for appointment ${appointment.id}:`, error);
        }
      }
    }

    console.log(`🎉 Scheduled reminder check complete. Sent ${remindersSent} reminders.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully sent ${remindersSent} appointment reminders`,
        remindersSent,
        appointments24h: appointments24h?.length || 0,
        appointments2h: appointments2h?.length || 0,
        success: true
      })
    };

  } catch (error) {
    console.error('❌ Error in scheduled reminder check:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process scheduled reminders',
        error: error.message,
        success: false
      })
    };
  }
};

// Helper function to send individual reminder (reused from send-appointment-reminders.js)
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
        </div>

        <!-- Contact Information -->
        <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Questions or Changes?</h3>
          <div style="color: #065f46;">
            <strong>Phone:</strong> (954) 937-9667<br>
            <strong>Email:</strong> info@warehouselocating.com
          </div>
        </div>

        <p style="font-size: 16px; color: #374151; margin-top: 25px;">
          We're looking forward to meeting with you!
        </p>

        <p style="margin-top: 20px; color: #374151;">
          Best regards,<br>
          <strong>The Shallow Bay Advisors Team</strong>
        </p>
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
      title: `${timeframe} appointment reminder sent (auto)`,
      description: `Automated reminder email sent to ${lead.email} for appointment on ${formattedDate} at ${formattedTime}`,
      metadata: {
        reminder_type: timeframe,
        appointment_id: appointment.id,
        email_sent_to: lead.email,
        automated: true
      }
    }]);
}

// Log function for debugging
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}