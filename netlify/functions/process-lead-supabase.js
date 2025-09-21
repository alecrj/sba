// Updated process-lead function to integrate with Supabase CRM
const { createClient } = require('@supabase/supabase-js');

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
    const propertyInterest = property_interest || warehouse_interest || '';
    const budgetRange = budget_range || price_range || '';

    // Validate required fields
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Name and email are required' })
      };
    }

    console.log(`Processing lead from ${name} (${email}) for CRM`);

    // Determine lead type based on form data
    let leadType = 'general-inquiry';
    if (propertyInterest && propertyInterest !== 'any') {
      leadType = 'property-inquiry';
    }

    // Create lead title
    const leadTitle = `${leadType.replace('-', ' ')} - ${name}${company ? ` (${company})` : ''}`;

    // Prepare lead data for Supabase
    const leadData = {
      title: leadTitle,
      type: leadType,
      status: 'new',
      priority: 'medium',
      name: name,
      email: email,
      phone: phone || null,
      company: company || null,
      property_interest: propertyInterest || null,
      space_requirements: `Size needed: ${size_needed || 'Not specified'}\\nCounty preference: ${county || 'Any'}`,
      budget: budgetRange || null,
      timeline: timeline || null,
      message: message || null,
      source: source,
      consultation_date: null,
      consultation_time: null,
      follow_up_date: null,
      internal_notes: `Lead submitted from website contact form. Warehouse ID: ${warehouse_id || 'N/A'}`
    };

    // Insert lead into Supabase
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (leadError) {
      console.error('Supabase lead creation error:', leadError);
      throw new Error(`Failed to create lead: ${leadError.message}`);
    }

    console.log(`Lead created in CRM with ID: ${newLead.id}`);

    // Log initial activity
    if (newLead) {
      const { error: activityError } = await supabase
        .from('lead_activities')
        .insert([{
          lead_id: newLead.id,
          activity_type: 'note',
          title: 'Lead created from website',
          description: `New lead created from ${source}${propertyInterest ? ` - Interest: ${propertyInterest}` : ''}`,
          metadata: {
            source: source,
            type: leadType,
            form_data: formData
          }
        }]);

      if (activityError) {
        console.error('Activity log error:', activityError);
        // Don't fail the whole process for activity log errors
      }
    }

    // Send notification emails (optional - you can customize this)
    const baseUrl = process.env.URL;

    if (baseUrl) {
      // Send auto-response to client
      try {
        const autoResponse = await fetch(`${baseUrl}/.netlify/functions/send-auto-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadData: formData,
            leadId: newLead.id,
            crmUrl: process.env.CRM_URL || 'https://your-crm-domain.com'
          })
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
        message: 'Lead submitted successfully to CRM',
        leadId: newLead.id,
        success: true
      })
    };

  } catch (error) {
    console.error('Error processing lead:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
        success: false
      })
    };
  }
};