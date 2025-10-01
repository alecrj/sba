// Fix calendar availability by adding Monday and Wednesday
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otdstubixarpsirhcpcq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZHN0dWJpeGFycHNpcmhjcGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTk0OTAsImV4cCI6MjA3Mzk5NTQ5MH0.K3mftgyz41BtZ-7GxLHzKapoGN7xK0foXEFFyIYOaBI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCalendarAvailability() {
  const propertyId = 'c21cdd24-bfcd-4cec-bff0-9aae187cac1b';

  console.log('🔧 Adding Monday and Wednesday availability...');

  // Add Monday (day_of_week = 1)
  const mondayResult = await supabase
    .from('calendar_availability')
    .insert({
      property_id: propertyId,
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '17:00:00',
      slot_duration: 30,
      is_active: true
    });

  if (mondayResult.error) {
    console.error('❌ Error adding Monday:', mondayResult.error);
  } else {
    console.log('✅ Monday availability added');
  }

  // Add Wednesday (day_of_week = 3)
  const wednesdayResult = await supabase
    .from('calendar_availability')
    .insert({
      property_id: propertyId,
      day_of_week: 3,
      start_time: '09:00:00',
      end_time: '17:00:00',
      slot_duration: 30,
      is_active: true
    });

  if (wednesdayResult.error) {
    console.error('❌ Error adding Wednesday:', wednesdayResult.error);
  } else {
    console.log('✅ Wednesday availability added');
  }

  // Verify current configuration
  console.log('\n📋 Current availability configuration:');
  const { data: availability } = await supabase
    .from('calendar_availability')
    .select('day_of_week, start_time, end_time, is_active')
    .eq('property_id', propertyId)
    .eq('is_active', true)
    .order('day_of_week');

  if (availability) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    availability.forEach(row => {
      console.log(`   ${dayNames[row.day_of_week]}: ${row.start_time} - ${row.end_time}`);
    });
  }

  console.log('\n🎉 Calendar availability configuration complete!');
}

fixCalendarAvailability().catch(console.error);