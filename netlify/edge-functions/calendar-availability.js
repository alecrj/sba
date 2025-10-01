import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Use the same Supabase connection as your CRM
const supabaseUrl = 'https://otdstubixarpsirhcpcq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZHN0dWJpeGFycHNpcmhjcGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTk0OTAsImV4cCI6MjA3Mzk5NTQ5MH0.K3mftgyz41BtZ-7GxLHzKapoGN7xK0foXEFFyIYOaBI';

export default async (request, context) => {
  try {
    console.log('🟢 NETLIFY EDGE FUNCTION CALENDAR API CALLED');

    // Parse query parameters from the URL
    const url = new URL(request.url);
    const propertyId = url.searchParams.get('propertyId');
    const date = url.searchParams.get('date');

    console.log('Query parameters:', { propertyId, date });

    if (!propertyId || !date) {
      return new Response(JSON.stringify({
        error: 'propertyId and date are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the day of week for the requested date (0 = Sunday, 1 = Monday, etc.)
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();

    // Check if property has calendar configuration
    const { data: calendar, error: calendarError } = await supabase
      .from('property_calendars')
      .select('id, is_active')
      .eq('property_id', propertyId)
      .maybeSingle();

    if (calendarError) {
      console.error('Calendar lookup error:', calendarError);
      return new Response(JSON.stringify({
        success: false,
        available: false,
        reason: 'Database error',
        error: calendarError.message
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (!calendar || !calendar.is_active) {
      console.log('No calendar found or inactive for property:', propertyId);
      return new Response(JSON.stringify({
        success: false,
        available: false,
        reason: 'Property not found or no calendar configured'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Check if this day of week is available
    const { data: availability, error: availError } = await supabase
      .from('calendar_availability')
      .select('start_time, end_time, is_active')
      .eq('property_id', propertyId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (availError || !availability) {
      return new Response(JSON.stringify({
        success: false,
        available: false,
        reason: 'Day not available'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Generate time slots based on start and end time
    const timeSlots = [];
    const startHour = parseInt(availability.start_time.split(':')[0]);
    const endHour = parseInt(availability.end_time.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
      const timeHalf12 = hour > 12 ? `${hour - 12}:30 PM` : hour === 12 ? '12:30 PM' : `${hour}:30 AM`;

      timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:00:00`,
        display_time: time12,
        available: true
      });

      if (hour + 0.5 < endHour) {
        timeSlots.push({
          time: `${hour.toString().padStart(2, '0')}:30:00`,
          display_time: timeHalf12,
          available: true
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      available: true,
      property_id: propertyId,
      date: date,
      day_of_week: dayOfWeek,
      available_slots: timeSlots
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Calendar availability error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};