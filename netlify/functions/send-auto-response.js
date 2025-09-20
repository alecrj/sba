// Fixed send-auto-response.js function
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
    
    // Determine if this is a property-specific inquiry
    const isPropertyInquiry = leadData.source && leadData.source.includes('property_page');
    
    console.log(`Processing ${isPropertyInquiry ? 'property' : 'general'} inquiry for ${leadData.name}`);
    
    // Generate content based on form type
    let emailContent = {
      from_email: 'info@warehouselocating.com', // Override sender address
      from_name: 'Warehouse Locating',
      to_email: leadData.email,
      to_name: leadData.name,
      lead_name: leadData.name,
      company_name: leadData.company || 'your company',
      message: leadData.message || 'No additional requirements specified',
      timeline: leadData.timeline || 'Flexible',
      client_name: 'Warehouse Locating Team',
      specialist_title: isPropertyInquiry ? 'Senior Leasing Specialist' : 'Senior Warehouse Specialist',
      whatsapp_message: encodeURIComponent(`Hi, I'm ${leadData.name} and I just submitted a warehouse inquiry. I'd like to discuss my options.`)
    };
    
    if (isPropertyInquiry) {
      // Property-specific inquiry content
      emailContent = {
        ...emailContent,
        subject: `Thank you for your interest in ${leadData.warehouse_interest || 'our warehouse property'}!`,
        
        // Header
        header_subtitle: "Your Warehouse Tour Awaits",
        
        // Greeting and opening
        greeting_message: `Thank you for your interest, ${leadData.name}! 🎯`,
        opening_message: `Thank you for your inquiry about ${leadData.warehouse_interest || 'our warehouse property'}. We've received your request and are excited to show ${leadData.company || 'your company'} this exceptional warehouse opportunity.`,
        
        // Details section
        details_section_title: "Property You're Interested In:",
        inquiry_focus: `📍 ${leadData.warehouse_interest || 'Warehouse Property'}`,
        size_label: "Size",
        size_value: `${leadData.property_size || 'Contact for details'} SF`,
        location_label: "Location", 
        location_value: leadData.property_location || 'South Florida',
        budget_label: "Rate",
        budget_value: leadData.budget_range || leadData.property_price || 'Contact for pricing',
        
        // Process section
        process_title: "What happens next:",
        process_content: "✅ <strong>Property Verification:</strong> We'll confirm current availability and terms<br><br>📞 <strong>Personal Call:</strong> Our specialist will contact you within 24 hours<br><br>📅 <strong>Tour Scheduling:</strong> We'll arrange a convenient viewing time<br><br>📋 <strong>Detailed Information:</strong> You'll receive complete property specs and pricing<br><br>🤝 <strong>Lease Assistance:</strong> We'll help negotiate the best terms",
        
        // Contact section
        contact_title: "Want to Tour This Property Today?",
        contact_subtitle: "Call us now to schedule an immediate viewing!",
        
        // WhatsApp message
        whatsapp_message: encodeURIComponent(`Hi, I'm ${leadData.name} and I'm interested in touring ${leadData.warehouse_interest}. When can we schedule a viewing?`)
      };
    } else {
      // General matching service content
      emailContent = {
        ...emailContent,
        subject: `We're finding your perfect warehouse space, ${leadData.name}!`,
        
        // Header
        header_subtitle: "Finding Your Perfect South Florida Warehouse",
        
        // Greeting and opening
        greeting_message: `Great news, ${leadData.name}! We're on it! 🚀`,
        opening_message: `Thank you for using our warehouse matching service! We've received your requirements and our team is already searching our database to find the perfect warehouse options for ${leadData.company || 'your company'} in South Florida.`,
        
        // Details section
        details_section_title: "Your Warehouse Requirements:",
        inquiry_focus: `🔍 Searching for: ${leadData.size_needed || 'Warehouse space'} in ${leadData.county || 'South Florida'}`,
        size_label: "Size Needed",
        size_value: leadData.size_needed || 'To be determined',
        location_label: "Preferred Location",
        location_value: leadData.county || 'Any location in South Florida', 
        budget_label: "Budget Range",
        budget_value: leadData.budget_range || 'To be discussed',
        
        // Process section
        process_title: "How our matching process works:",
        process_content: "🔍 <strong>Database Search:</strong> We're scanning our exclusive database of South Florida warehouses<br><br>📋 <strong>Requirements Matching:</strong> Filtering options that meet your specific needs<br><br>💰 <strong>Pricing Analysis:</strong> Ensuring options fit within your budget range<br><br>📞 <strong>Personal Consultation:</strong> Our specialist will call you within 24 hours<br><br>📧 <strong>Curated Options:</strong> You'll receive 3-5 qualified warehouse matches",
        
        // Contact section
        contact_title: "Can't Wait? Contact Us Now!",
        contact_subtitle: "",
        
        // WhatsApp message
        whatsapp_message: encodeURIComponent(`Hi, I'm ${leadData.name} and I just submitted warehouse requirements. I'd like to discuss my options.`)
      };
    }

    console.log('Sending auto-response email via SMTP...');

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

    // Send auto-response email
    await transporter.sendMail({
      from: `"Warehouse Locating" <${process.env.SMTP_USER}>`,
      to: emailContent.to_email,
      subject: emailContent.subject || `Thank you for your inquiry, ${emailContent.lead_name}!`,
      html: `
        <h2>Thank you for your inquiry!</h2>
        <p>Dear ${emailContent.lead_name},</p>
        <p>${emailContent.opening_message}</p>
        <p>We'll be in touch within 24 hours.</p>
        <p>Best regards,<br>Warehouse Locating Team</p>
      `
    });

    console.log('Auto-response email sent successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Auto-response sent successfully',
        inquiry_type: isPropertyInquiry ? 'property' : 'general' 
      })
    };

  } catch (error) {
    console.error('Error sending auto-response:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to send auto-response',
        error: error.message 
      })
    };
  }
};