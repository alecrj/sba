// Process appointment bookings via CRM API
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Get CRM URL from environment
    const crmUrl = process.env.CRM_URL || 'https://sbaycrm.netlify.app';

    // Parse appointment data
    const appointmentData = JSON.parse(event.body);
    const {
      name,
      email,
      phone,
      company,
      appointment_type,
      appointment_date,
      appointment_time,
      property_id,
      property_title,
      message,
      source = 'appointment_booking'
    } = appointmentData;

    // Validate required fields
    if (!name || !email || !phone || !appointment_type || !appointment_date || !appointment_time) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required appointment information' })
      };
    }

    console.log(`Processing appointment booking for ${name} (${email}) on ${appointment_date} at ${appointment_time}`);

    // Send appointment data to CRM API (this handles lead creation, appointment creation, and reminders)
    const crmResponse = await fetch(`${crmUrl}/api/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        company: company,
        appointment_type: appointment_type,
        appointment_date: appointment_date,
        appointment_time: appointment_time,
        property_title: property_title,
        property_interest: property_title,
        message: message,
        source: source,
        priority: 'high',
        type: 'consultation'
      })
    });

    if (!crmResponse.ok) {
      const errorText = await crmResponse.text();
      console.error('CRM API failed:', errorText);
      throw new Error(`Failed to create appointment in CRM: ${errorText}`);
    }

    const crmResult = await crmResponse.json();
    console.log('CRM API success:', crmResult);

    const newLead = { id: crmResult.leadId };
    const newAppointment = { id: crmResult.appointmentId };

    // Send confirmation emails and sync with Google Calendar
    const baseUrl = process.env.URL;
    if (baseUrl) {
      try {
        // Send confirmation emails
        const confirmationResponse = await fetch(`${baseUrl}/.netlify/functions/send-appointment-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentData,
            leadId: newLead.id,
            appointmentId: newAppointment?.id,
            appointmentDetails: {
              type: typeInfo.label,
              duration: typeInfo.duration,
              date: appointment_date,
              time: appointment_time
            }
          })
        });

        if (!confirmationResponse.ok) {
          console.error('Confirmation email failed:', await confirmationResponse.text());
        } else {
          console.log('Confirmation email sent successfully');
        }

        // Sync with Google Calendar
        if (newAppointment?.id) {
          const calendarResponse = await fetch(`${baseUrl}/.netlify/functions/google-calendar-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: newAppointment.id,
              action: 'create'
            })
          });

          if (!calendarResponse.ok) {
            console.error('Google Calendar sync failed:', await calendarResponse.text());
          } else {
            console.log('Google Calendar event created successfully');
          }
        }
      } catch (error) {
        console.error('Post-booking process error:', error);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        message: 'Appointment booked successfully',
        leadId: newLead.id,
        appointmentId: newAppointment?.id,
        success: true
      })
    };

  } catch (error) {
    console.error('Error processing appointment:', error);
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