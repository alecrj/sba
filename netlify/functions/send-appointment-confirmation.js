// Send appointment confirmation emails to both client and lead
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { appointmentData, leadId, appointmentId, appointmentDetails } = JSON.parse(event.body);

    console.log(`Sending appointment confirmation emails for ${appointmentData.name}`);

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

    // Format appointment date and time
    const appointmentDate = new Date(appointmentData.appointment_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create calendar event details
    const calendarEventStart = new Date(`${appointmentData.appointment_date}T${convertToTimeString(appointmentData.appointment_time)}`);
    const calendarEventEnd = new Date(calendarEventStart.getTime() + (appointmentDetails.duration * 60 * 1000));

    // Generate calendar invite content
    const calendarInvite = generateCalendarInvite({
      title: `${appointmentDetails.type} - ${appointmentData.name}`,
      start: calendarEventStart,
      end: calendarEventEnd,
      location: 'Shallow Bay Advisors Office (Location to be confirmed)',
      description: `${appointmentDetails.type} appointment with ${appointmentData.name}${appointmentData.company ? ` from ${appointmentData.company}` : ''}${appointmentData.property_title ? ` regarding ${appointmentData.property_title}` : ''}`,
      attendeeEmail: appointmentData.email,
      attendeeName: appointmentData.name
    });

    // Send confirmation email to lead (customer)
    const leadEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafb;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Appointment Confirmed! ✅</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We're excited to meet with you</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${appointmentData.name},</p>

          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 25px;">
            Thank you for scheduling an appointment with Shallow Bay Advisors! We've confirmed your <strong>${appointmentDetails.type}</strong>
            and are looking forward to helping you find the perfect commercial space.
          </p>

          <!-- Appointment Details Box -->
          <div style="background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📅 Appointment Details</h3>
            <div style="margin-bottom: 10px;"><strong>Type:</strong> ${appointmentDetails.type}</div>
            <div style="margin-bottom: 10px;"><strong>Date:</strong> ${formattedDate}</div>
            <div style="margin-bottom: 10px;"><strong>Time:</strong> ${appointmentData.appointment_time}</div>
            <div style="margin-bottom: 10px;"><strong>Duration:</strong> ${appointmentDetails.duration} minutes</div>
            <div style="margin-bottom: 10px;"><strong>Location:</strong> Shallow Bay Advisors Office (Address to be confirmed)</div>
            ${appointmentData.property_title ? `<div style="margin-bottom: 10px;"><strong>Property of Interest:</strong> ${appointmentData.property_title}</div>` : ''}
          </div>

          <!-- What to Expect -->
          <div style="margin: 25px 0;">
            <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">What to Expect:</h3>
            <ul style="color: #374151; line-height: 1.6; padding-left: 20px;">
              <li>Discussion of your commercial real estate requirements</li>
              <li>Market insights and available opportunities</li>
              <li>Tailored recommendations based on your needs</li>
              ${appointmentData.property_title ? '<li>Detailed information about your property of interest</li>' : ''}
              <li>Next steps in your commercial space search</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Need to Make Changes?</h3>
            <p style="margin: 0; color: #065f46;">
              If you need to reschedule or have any questions, please contact us:
            </p>
            <div style="margin-top: 10px; color: #065f46;">
              <strong>Phone:</strong> (954) 937-9667<br>
              <strong>Email:</strong> info@warehouselocating.com
            </div>
          </div>

          <!-- Reminders -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              📬 <strong>Reminders:</strong> We'll send you reminder emails 24 hours and 2 hours before your appointment.
            </p>
          </div>

          <p style="font-size: 16px; color: #374151; margin-top: 25px;">
            Thank you for choosing Shallow Bay Advisors for your commercial real estate needs!
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
          <p>This is an automated confirmation email.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Shallow Bay Advisors" <${process.env.SMTP_USER}>`,
      to: appointmentData.email,
      subject: `Appointment Confirmed - ${appointmentDetails.type} on ${formattedDate}`,
      html: leadEmailHtml,
      attachments: [{
        filename: 'appointment.ics',
        content: calendarInvite,
        contentType: 'text/calendar'
      }]
    });

    // Send notification email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">🗓️ New Appointment Booked</h2>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Appointment Details</h3>
          <p><strong>Client:</strong> ${appointmentData.name}</p>
          <p><strong>Email:</strong> ${appointmentData.email}</p>
          <p><strong>Phone:</strong> ${appointmentData.phone}</p>
          ${appointmentData.company ? `<p><strong>Company:</strong> ${appointmentData.company}</p>` : ''}
          <p><strong>Type:</strong> ${appointmentDetails.type}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointmentData.appointment_time}</p>
          <p><strong>Duration:</strong> ${appointmentDetails.duration} minutes</p>
          ${appointmentData.property_title ? `<p><strong>Property Interest:</strong> ${appointmentData.property_title}</p>` : ''}
        </div>

        ${appointmentData.message ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #92400e;">Additional Details:</h4>
          <p style="color: #92400e; margin-bottom: 0;">${appointmentData.message}</p>
        </div>
        ` : ''}

        <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 6px;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Lead ID:</strong> ${leadId}<br>
            ${appointmentId ? `<strong>Appointment ID:</strong> ${appointmentId}<br>` : ''}
            <strong>Source:</strong> Calendar Booking Widget
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Shallow Bay Advisors CRM" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `🗓️ New Appointment: ${appointmentData.name} - ${appointmentDetails.type} on ${formattedDate}`,
      html: clientEmailHtml,
      attachments: [{
        filename: 'appointment.ics',
        content: calendarInvite,
        contentType: 'text/calendar'
      }]
    });

    console.log('Appointment confirmation emails sent successfully');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        message: 'Appointment confirmation emails sent successfully',
        success: true
      })
    };

  } catch (error) {
    console.error('Error sending appointment confirmation emails:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to send appointment confirmation emails',
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

// Helper function to generate calendar invite (.ics file)
function generateCalendarInvite({ title, start, end, location, description, attendeeEmail, attendeeName }) {
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const uid = `appointment-${Date.now()}@shallowbayadvisors.com`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shallow Bay Advisors//Appointment Booking//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ATTENDEE;CN=${attendeeName};RSVP=TRUE:mailto:${attendeeEmail}`,
    'ORGANIZER;CN=Shallow Bay Advisors:mailto:info@warehouselocating.com',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:EMAIL',
    'DESCRIPTION:Reminder: Appointment in 24 hours',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:EMAIL',
    'DESCRIPTION:Reminder: Appointment in 2 hours',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}