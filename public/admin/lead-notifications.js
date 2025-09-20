// Enhanced Lead Notification System for Shallow Bay Advisors CMS
// This script adds automatic email notifications when leads are created

// Function to send email notification when a new lead is created
function sendLeadNotification(leadData) {
  // This would integrate with your email service (SendGrid, Mailgun, etc.)
  const notificationData = {
    to: 'info@shallowbayadvisors.com', // Your business email
    subject: `🚨 New Lead: ${leadData.type} from ${leadData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E3A5F; color: white; padding: 20px; text-align: center;">
          <h1>New Lead - Shallow Bay Advisors</h1>
        </div>

        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #1E3A5F;">Lead Details</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${leadData.name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${leadData.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${leadData.phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Company:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${leadData.company || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${leadData.type}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${leadData.priority}</td></tr>
          </table>

          ${leadData.space_requirements ? `
          <h3 style="color: #1E3A5F; margin-top: 20px;">Space Requirements</h3>
          <p style="background: white; padding: 15px; border-left: 4px solid #1E3A5F;">${leadData.space_requirements}</p>
          ` : ''}

          ${leadData.message ? `
          <h3 style="color: #1E3A5F; margin-top: 20px;">Message</h3>
          <p style="background: white; padding: 15px; border-left: 4px solid #1E3A5F;">${leadData.message}</p>
          ` : ''}

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://shabay.netlify.app/admin" style="background: #1E3A5F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Manage Lead in CMS
            </a>
          </div>
        </div>

        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This notification was sent automatically when a new lead was created in your Shallow Bay Advisors CMS.</p>
          <p>Lead created on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  };

  // You would send this via your preferred email service
  console.log('Lead notification ready to send:', notificationData);
  return notificationData;
}

// Auto-categorize leads based on content
function categorizeLeadType(formData) {
  const message = (formData.message || '').toLowerCase();
  const spaceReq = (formData.space_requirements || '').toLowerCase();

  if (message.includes('warehouse') || spaceReq.includes('warehouse')) return 'warehouse-inquiry';
  if (message.includes('office') || spaceReq.includes('office')) return 'office-inquiry';
  if (message.includes('consultation') || message.includes('meeting')) return 'consultation';

  return 'general-inquiry';
}

// Auto-set priority based on urgency indicators
function determinePriority(formData) {
  const message = (formData.message || '').toLowerCase();
  const timeline = (formData.timeline || '').toLowerCase();

  if (message.includes('urgent') || message.includes('asap') || timeline.includes('immediate')) return 'urgent';
  if (message.includes('soon') || timeline.includes('month')) return 'high';
  if (timeline.includes('quarter') || timeline.includes('3 months')) return 'medium';

  return 'medium';
}

// Export functions for use in forms
window.SBALeadSystem = {
  sendLeadNotification,
  categorizeLeadType,
  determinePriority
};