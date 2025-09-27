const { Resend } = require('resend');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { leadData, leadId, type } = JSON.parse(event.body);

    // Initialize Resend with API key (no email passwords needed!)
    const resend = new Resend(process.env.RESEND_API_KEY);

    let emailContent, subject, to, from;

    // Set from address based on environment
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Shallow Bay Advisors';

    if (type === 'notification') {
      // Client notification email
      to = process.env.NOTIFICATION_EMAIL || 'info@warehouselocating.com';
      subject = `🚨 New Lead: ${leadData.name} - ${leadData.warehouse_interest || 'General Inquiry'}`;

      emailContent = `
        <h2>New Lead Alert!</h2>
        <p><strong>Name:</strong> ${leadData.name}</p>
        <p><strong>Email:</strong> ${leadData.email}</p>
        <p><strong>Phone:</strong> ${leadData.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${leadData.company || 'Not provided'}</p>
        <p><strong>Property Interest:</strong> ${leadData.warehouse_interest || 'Not specified'}</p>
        <p><strong>Budget:</strong> ${leadData.budget_range || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${leadData.timeline || 'Not specified'}</p>
        <p><strong>Message:</strong> ${leadData.message || 'No message'}</p>
        <p><strong>Source:</strong> ${leadData.source}</p>
        <p><strong>Lead ID:</strong> ${leadId}</p>
        <hr>
        <p><a href="tel:${leadData.phone}">Call ${leadData.name}</a> | <a href="mailto:${leadData.email}">Email ${leadData.name}</a></p>
      `;
    } else {
      // Auto-response email to lead
      to = leadData.email;
      subject = 'Thank you for your warehouse inquiry - We\'ll be in touch within 24 hours';

      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a202c; color: white; padding: 30px; text-align: center;">
            <h1>🎯 WAREHOUSE LOCATING</h1>
            <p>South Florida's Warehouse Specialists</p>
          </div>

          <div style="padding: 30px;">
            <h2>Thank you for your inquiry, ${leadData.name}!</h2>

            <p>We've received your warehouse inquiry and will get back to you within 24 hours with qualified options.</p>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Your Requirements:</h3>
              <p><strong>Property Interest:</strong> ${leadData.warehouse_interest || 'Any Available Property'}</p>
              <p><strong>Budget:</strong> ${leadData.budget_range || 'To be discussed'}</p>
              <p><strong>Timeline:</strong> ${leadData.timeline || 'To be discussed'}</p>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3>Contact us anytime:</h3>
              <p><a href="tel:954-937-9667" style="color: #10b981; text-decoration: none;">📞 (954) 937-9667</a></p>
              <p><a href="mailto:info@warehouselocating.com" style="color: #3b82f6; text-decoration: none;">📧 info@warehouselocating.com</a></p>
            </div>

            <p style="color: #666;">Best regards,<br><strong>Laec Buchalter</strong><br>Warehouse Specialist<br>Warehouse Locating</p>
          </div>
        </div>
      `;
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: emailContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Failed to send ${type || 'email'}`,
          error: error.message
        })
      };
    }

    console.log(`${type} email sent successfully to ${to}`, data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${type} email sent successfully`,
        id: data?.id
      })
    };

  } catch (error) {
    console.error(`Error sending ${event.type || 'email'}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Failed to send ${event.type || 'email'}`,
        error: error.message
      })
    };
  }
};