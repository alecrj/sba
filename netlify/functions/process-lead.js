// Fixed process-lead.js function
const { Octokit } = require("@octokit/rest");
const crypto = require('crypto');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const formData = JSON.parse(event.body);
    const {
      name,
      email,
      phone,
      company,
      property_interest,
      warehouse_interest,
      warehouse_id,
      budget_range,
      price_range,
      size_needed,
      county,
      timeline,
      message,
      source = 'website_form'
    } = formData;

    // Handle different field names from different forms
    const warehouseInterest = property_interest || warehouse_interest || '';
    const budgetRange = budget_range || price_range || '';
    const sizeRange = size_needed || '';

    // Validate required fields
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Name and email are required' })
      };
    }

    // Generate unique ID for lead
    const leadId = `lead-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const submittedDate = new Date().toISOString();

    console.log(`Processing lead from ${name} (${email})`);

    // Create lead content
    const leadContent = `---
name: "${name}"
email: "${email}"
phone: "${phone || ''}"
company: "${company || ''}"
warehouse_interest: "${warehouseInterest}"
warehouse_id: "${warehouse_id || ''}"
budget_range: "${budgetRange}"
size_needed: "${sizeRange}"
county: "${county || ''}"
timeline: "${timeline || ''}"
message: "${message || ''}"
status: "new"
source: "${source}"
submitted_date: "${submittedDate}"
notes: ""
priority: "medium"
follow_up_date: ""
---

Lead submitted through contact form${warehouseInterest ? ` for ${warehouseInterest}` : ''}.
${message ? `Initial inquiry: ${message}` : ''}
`;

    // Initialize Octokit
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Get repository info from environment
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!owner || !repo) {
      throw new Error('GitHub repository information not configured');
    }

    // Create lead file in GitHub
    const filePath = `content/leads/${leadId}.md`;
    
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Add new lead: ${name} - ${email}`,
      content: Buffer.from(leadContent).toString('base64'),
      branch
    });

    console.log(`Lead file created: ${filePath}`);

    // Send notification emails
    const baseUrl = process.env.URL;
    
    if (baseUrl) {
      // Send client notification
      try {
        const clientResponse = await fetch(`${baseUrl}/.netlify/functions/send-client-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadData: formData, leadId })
        });
        
        if (!clientResponse.ok) {
          console.error('Client notification failed:', await clientResponse.text());
        } else {
          console.log('Client notification sent successfully');
        }
      } catch (error) {
        console.error('Client notification error:', error);
      }

      // Send auto-response
      try {
        const autoResponse = await fetch(`${baseUrl}/.netlify/functions/send-auto-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadData: formData, leadId })
        });
        
        if (!autoResponse.ok) {
          console.error('Auto-response failed:', await autoResponse.text());
        } else {
          console.log('Auto-response sent successfully');
        }
      } catch (error) {
        console.error('Auto-response error:', error);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        message: 'Lead submitted successfully',
        leadId: leadId
      })
    };

  } catch (error) {
    console.error('Error processing lead:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error.message 
      })
    };
  }
};