// Direct database integration for calendar availability
// This connects to the CRM database to fetch real calendar configurations
import { createClient } from '@supabase/supabase-js';

// Use the same Supabase connection as your CRM
const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://otdstubixarpsirhcpcq.supabase.co';
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZHN0dWJpeGFycHNpcmhjcGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTk0OTAsImV4cCI6MjA3Mzk5NTQ5MH0.K3mftgyz41BtZ-7GxLHzKapoGN7xK0foXEFFyIYOaBI';
const supabase = createClient(supabaseUrl, supabaseKey);

export const GET = async ({ request, url }) => {
  try {
    console.log('Calendar availability API called with URL:', url?.toString());
    console.log('Request URL:', request?.url);

    // Try to get parameters from both url and request.url
    const urlObj = new URL(request.url);
    const propertyId = urlObj.searchParams.get('propertyId');
    const date = urlObj.searchParams.get('date');
    console.log('Parsed parameters:', { propertyId, date });

    if (!propertyId || !date) {
      return new Response(JSON.stringify({
        error: 'propertyId and date are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the day of week for the requested date
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();

    // Check if property has calendar configuration
    const { data: calendar, error: calendarError } = await supabase
      .from('property_calendars')
      .select('id, is_active')
      .eq('property_id', propertyId)
      .single();

    if (calendarError || !calendar || !calendar.is_active) {
      return new Response(JSON.stringify({
        available: false,
        reason: 'No calendar configured or calendar inactive'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if this day of week is available
    const { data: availability, error: availError } = await supabase
      .from('calendar_availability')
      .select('start_time, end_time, is_active')
      .eq('property_id', propertyId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single();

    if (availError || !availability) {
      return new Response(JSON.stringify({
        available: false,
        reason: 'Day not available'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for blocked dates
    const { data: blocked } = await supabase
      .from('calendar_blocked_dates')
      .select('id')
      .eq('calendar_id', calendar.id)
      .eq('blocked_date', date)
      .eq('is_active', true);

    if (blocked && blocked.length > 0) {
      return new Response(JSON.stringify({
        available: false,
        reason: 'Date is blocked'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return availability with time slots
    return new Response(JSON.stringify({
      available: true,
      property_id: propertyId,
      date: date,
      day_of_week: dayOfWeek,
      start_time: availability.start_time,
      end_time: availability.end_time
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Calendar availability error:', error);
    return new Response(JSON.stringify({
      available: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}