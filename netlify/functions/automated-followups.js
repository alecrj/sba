// Automated follow-up email sequences after appointments
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

exports.handler = async (event, context) => {
  try {
    console.log('🔄 Running automated follow-up check...');

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();

    // Get appointments that ended and need follow-ups
    const followUpSequences = [
      {
        hours: 2,
        type: 'immediate_followup',
        subject: 'Thank you for meeting with us today!'
      },
      {
        hours: 24,
        type: '24h_followup',
        subject: 'Following up on our meeting - Next Steps'
      },
      {
        hours: 72,
        type: '3day_followup',
        subject: 'Checking in - Any questions from our meeting?'
      },
      {
        hours: 168,
        type: '1week_followup',
        subject: 'Weekly check-in - How can we help move forward?'
      }
    ];

    let totalFollowUpsSent = 0;

    // Process each follow-up sequence
    for (const sequence of followUpSequences) {
      const timeAgo = new Date(now.getTime() - (sequence.hours * 60 * 60 * 1000));
      const timeAgoPlus1Hour = new Date(now.getTime() - ((sequence.hours - 1) * 60 * 60 * 1000));

      console.log(`Checking for ${sequence.type} follow-ups (${sequence.hours}h after appointment end)`);

      // Find completed appointments that need this follow-up
      const { data: appointmentsNeedingFollowUp, error } = await supabase
        .from('appointments')
        .select(`
          *,
          leads (
            id, name, email, phone, company
          )
        `)
        .eq('status', 'completed')
        .lte('end_time', timeAgo.toISOString())
        .gt('end_time', timeAgoPlus1Hour.toISOString())
        .is(`followup_${sequence.type}_sent`, false);

      if (error) {
        console.error(`Error fetching appointments for ${sequence.type}:`, error);
        continue;
      }

      if (appointmentsNeedingFollowUp?.length > 0) {
        console.log(`Found ${appointmentsNeedingFollowUp.length} appointments needing ${sequence.type}`);

        for (const appointment of appointmentsNeedingFollowUp) {
          try {
            await sendFollowUpEmail(appointment, sequence, supabase);
            totalFollowUpsSent++;
            console.log(`✅ ${sequence.type} sent for appointment ${appointment.id}`);
          } catch (error) {
            console.error(`❌ Failed to send ${sequence.type} for appointment ${appointment.id}:`, error);
          }
        }
      }
    }

    console.log(`🎉 Follow-up check complete. Sent ${totalFollowUpsSent} follow-ups.`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully sent ${totalFollowUpsSent} follow-up emails`,
        followUpsSent: totalFollowUpsSent,
        success: true
      })
    };

  } catch (error) {
    console.error('❌ Error in automated follow-up check:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process automated follow-ups',
        error: error.message,
        success: false
      })
    };
  }
};

// Send follow-up email based on sequence type
async function sendFollowUpEmail(appointment, sequence, supabase) {
  const lead = appointment.leads;
  if (!lead || !lead.email) {
    console.error(`No lead or email found for appointment ${appointment.id}`);
    return;
  }

  // Initialize Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = process.env.RESEND_FROM_NAME || 'Shallow Bay Advisors';

  const appointmentDate = new Date(appointment.start_time).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let emailHtml = '';
  let subject = sequence.subject;

  // Customize email content based on follow-up type
  switch (sequence.type) {
    case 'immediate_followup':
      emailHtml = getImmediateFollowUpEmail(lead, appointment, appointmentDate);
      break;
    case '24h_followup':
      emailHtml = get24HourFollowUpEmail(lead, appointment, appointmentDate);
      break;
    case '3day_followup':
      emailHtml = get3DayFollowUpEmail(lead, appointment, appointmentDate);
      break;
    case '1week_followup':
      emailHtml = get1WeekFollowUpEmail(lead, appointment, appointmentDate);
      break;
    default:
      emailHtml = getGenericFollowUpEmail(lead, appointment, appointmentDate);
  }

  // Send follow-up email using Resend
  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: [lead.email],
    subject: subject,
    html: emailHtml,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  // Update appointment to mark follow-up as sent
  const updateField = `followup_${sequence.type}_sent`;
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
      title: `${sequence.type.replace('_', ' ')} sent (auto)`,
      description: `Automated follow-up email sent to ${lead.email} for appointment on ${appointmentDate}`,
      metadata: {
        followup_type: sequence.type,
        appointment_id: appointment.id,
        email_sent_to: lead.email,
        automated: true
      }
    }]);
}

// Email templates for different follow-up types
function getImmediateFollowUpEmail(lead, appointment, appointmentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🙏 Thank You!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We appreciate you taking the time to meet with us today</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${lead.name},</p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Thank you for meeting with us today for your <strong>${appointment.title}</strong>. It was a pleasure discussing your commercial real estate needs and learning more about your business goals.
        </p>

        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📝 What's Next?</h3>
          <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
            <li>We'll review the information discussed today</li>
            <li>Prepare customized property recommendations</li>
            <li>Follow up within 24 hours with next steps</li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Have Questions?</h3>
          <div style="color: #065f46;">
            <strong>Phone:</strong> (954) 937-9667<br>
            <strong>Email:</strong> info@warehouselocating.com
          </div>
        </div>

        <p style="font-size: 16px; color: #374151; margin-top: 25px;">
          We're here to help you find the perfect commercial space for your business needs.
        </p>

        <p style="margin-top: 20px; color: #374151;">
          Best regards,<br>
          <strong>The Shallow Bay Advisors Team</strong>
        </p>
      </div>
    </div>
  `;
}

function get24HourFollowUpEmail(lead, appointment, appointmentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📋 Next Steps</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Following up on our meeting</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${lead.name},</p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          I wanted to follow up on our productive meeting yesterday regarding your ${appointment.title}. Based on our discussion, I've been working on some initial recommendations for you.
        </p>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #92400e;">🎯 What We're Working On</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Curating properties that match your specific requirements</li>
            <li>Analyzing market data for your target areas</li>
            <li>Preparing financial projections and recommendations</li>
            <li>Scheduling property viewings for promising opportunities</li>
          </ul>
        </div>

        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📞 Let's Schedule Your Next Step</h3>
          <p style="color: #1e40af; margin: 0;">
            I'd love to schedule a follow-up call this week to present my initial findings. When would work best for you?
          </p>
        </div>

        <!-- Contact Information -->
        <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Ready to Continue?</h3>
          <div style="color: #065f46;">
            <strong>Phone:</strong> (954) 937-9667<br>
            <strong>Email:</strong> info@warehouselocating.com
          </div>
        </div>

        <p style="font-size: 16px; color: #374151; margin-top: 25px;">
          Thank you for your time, and I look forward to helping you find the perfect commercial space.
        </p>

        <p style="margin-top: 20px; color: #374151;">
          Best regards,<br>
          <strong>The Shallow Bay Advisors Team</strong>
        </p>
      </div>
    </div>
  `;
}

function get3DayFollowUpEmail(lead, appointment, appointmentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">💼 Checking In</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Any questions from our meeting?</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${lead.name},</p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          I hope you've had a chance to think about our discussion from our meeting earlier this week. I wanted to check in and see if you have any questions or if there's anything specific you'd like me to focus on as we move forward.
        </p>

        <div style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #6b46c1;">❓ Common Questions We Can Help With</h3>
          <ul style="color: #6b46c1; margin: 0; padding-left: 20px;">
            <li>Financing options and pre-approval processes</li>
            <li>Market trends in your target areas</li>
            <li>Timeline expectations for finding the right space</li>
            <li>Due diligence and property evaluation criteria</li>
          </ul>
        </div>

        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">🚀 Ready for the Next Step?</h3>
          <p style="color: #1e40af; margin: 0;">
            I'm here to keep the momentum going. Just reply to this email or give me a call, and we can continue where we left off.
          </p>
        </div>

        <!-- Contact Information -->
        <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Get In Touch</h3>
          <div style="color: #065f46;">
            <strong>Phone:</strong> (954) 937-9667<br>
            <strong>Email:</strong> info@warehouselocating.com
          </div>
        </div>

        <p style="font-size: 16px; color: #374151; margin-top: 25px;">
          No pressure at all - just wanted to make sure you know I'm here when you're ready to take the next step.
        </p>

        <p style="margin-top: 20px; color: #374151;">
          Best regards,<br>
          <strong>The Shallow Bay Advisors Team</strong>
        </p>
      </div>
    </div>
  `;
}

function get1WeekFollowUpEmail(lead, appointment, appointmentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🔄 Weekly Check-in</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">How can we help move forward?</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${lead.name},</p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          It's been a week since our meeting, and I wanted to reach out to see how things are progressing with your commercial real estate search. I know these decisions take time, and I'm here to support you whenever you're ready.
        </p>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 15px 0; color: #92400e;">💡 Ways I Can Help This Week</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Send updated property listings that match your criteria</li>
            <li>Schedule property tours for spaces that interest you</li>
            <li>Provide market analysis for specific areas you're considering</li>
            <li>Connect you with financing partners or other professionals</li>
          </ul>
        </div>

        <div style="background: #ecfef3; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #047857;">✨ No Obligation</h3>
          <p style="color: #047857; margin: 0;">
            Even if you're not ready to move forward right now, I'm happy to keep you informed about new opportunities that might be a good fit. Just let me know what would be most helpful for you.
          </p>
        </div>

        <!-- Contact Information -->
        <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Let's Talk</h3>
          <div style="color: #065f46;">
            <strong>Phone:</strong> (954) 937-9667<br>
            <strong>Email:</strong> info@warehouselocating.com
          </div>
        </div>

        <p style="font-size: 16px; color: #374151; margin-top: 25px;">
          I'm committed to helping you find the right space at the right time. Don't hesitate to reach out whenever you have questions or are ready to take the next step.
        </p>

        <p style="margin-top: 20px; color: #374151;">
          Best regards,<br>
          <strong>The Shallow Bay Advisors Team</strong>
        </p>
      </div>
    </div>
  `;
}

function getGenericFollowUpEmail(lead, appointment, appointmentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
      <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📧 Follow-up</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Checking in after our meeting</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${lead.name},</p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          I wanted to follow up on our meeting regarding your ${appointment.title}. If you have any questions or would like to discuss next steps, please don't hesitate to reach out.
        </p>

        <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Contact Information</h3>
          <div style="color: #065f46;">
            <strong>Phone:</strong> (954) 937-9667<br>
            <strong>Email:</strong> info@warehouselocating.com
          </div>
        </div>

        <p style="margin-top: 20px; color: #374151;">
          Best regards,<br>
          <strong>The Shallow Bay Advisors Team</strong>
        </p>
      </div>
    </div>
  `;
}