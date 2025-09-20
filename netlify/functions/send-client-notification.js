// Fixed send-client-notification.js function
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { leadData, leadId } = JSON.parse(event.body);
    
    // Determine inquiry type
    const isPropertyInquiry = leadData.source && leadData.source.includes('property_page');
    
    console.log('Sending client notification email...');
    
    // Format the notification email content
    const emailContent = {
      from_email: 'info@warehouselocating.com', // Override sender address
      from_name: 'Warehouse Locating',
      to_email: 'info@warehouselocating.com', // Static client email
      to_name: 'Warehouse Locating Team', // Static client name
      subject: `🚨 New ${isPropertyInquiry ? 'Property' : 'Matching'} Lead: ${leadData.name} - ${leadData.warehouse_interest || 'General Inquiry'}`,
      
      // Header content
      inquiry_type_message: isPropertyInquiry 
        ? 'Specific property inquiry submitted' 
        : 'General warehouse matching request submitted',
      
      // Lead information
      lead_name: leadData.name,
      lead_email: leadData.email,
      lead_phone: leadData.phone || 'Not provided',
      lead_company: leadData.company || 'Not provided',
      
      // Inquiry details
      warehouse_interest: leadData.warehouse_interest || 'General inquiry',
      budget_range: leadData.budget_range || 'Not specified',
      timeline: leadData.timeline || 'Not specified',
      source: leadData.source || 'website_form',
      submitted_date: new Date().toLocaleString(),
      lead_id: leadId,
      message: leadData.message || 'No additional message provided',
      
      // CMS link
      cms_link: `${process.env.URL}/admin/#/collections/leads`,
      
      // System info
      auto_response_time: new Date().toLocaleString()
    };

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Send client notification email
    await transporter.sendMail({
      from: `"Warehouse Locating" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: emailContent.subject,
      html: `
        <h2>🚨 New Lead: ${emailContent.lead_name}</h2>
        <p><strong>Email:</strong> ${emailContent.lead_email}</p>
        <p><strong>Phone:</strong> ${emailContent.lead_phone}</p>
        <p><strong>Company:</strong> ${emailContent.lead_company}</p>
        <p><strong>Interest:</strong> ${emailContent.warehouse_interest}</p>
        <p><strong>Budget:</strong> ${emailContent.budget_range}</p>
        <p><strong>Message:</strong> ${emailContent.message}</p>
        <p><strong>Source:</strong> ${emailContent.source}</p>
        <p><strong>Submitted:</strong> ${emailContent.submitted_date}</p>
      `
    });

    console.log('Client notification email sent successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Client notification sent successfully' })
    };

  } catch (error) {
    console.error('Error sending client notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to send client notification',
        error: error.message 
      })
    };
  }
};