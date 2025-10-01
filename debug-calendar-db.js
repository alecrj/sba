// Debug calendar database entries to find Monday/Wednesday issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://otdstubixarpsirhcpcq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZHN0dWJpeGFycHNpcmhjcGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MTk0OTAsImV4cCI6MjA3Mzk5NTQ5MH0.K3mftgyz41BtZ-7GxLHzKapoGN7xK0foXEFFyIYOaBI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCalendarDatabase() {
  const propertyId = 'c21cdd24-bfcd-4cec-bff0-9aae187cac1b';

  console.log('🔍 Debugging calendar database for property:', propertyId);

  // 1. Check property_calendars table
  console.log('\n📋 Property calendars:');
  const { data: calendar, error: calendarError } = await supabase
    .from('property_calendars')
    .select('*')
    .eq('property_id', propertyId);

  if (calendarError) {
    console.error('❌ Calendar error:', calendarError);
  } else {
    console.log(calendar);
  }

  // 2. Check ALL calendar_availability entries (including inactive ones)
  console.log('\n📅 ALL calendar availability entries:');
  const { data: allAvailability, error: allError } = await supabase
    .from('calendar_availability')
    .select('*')
    .eq('property_id', propertyId)
    .order('day_of_week');

  if (allError) {
    console.error('❌ Availability error:', allError);
  } else {
    console.log('Total entries:', allAvailability?.length);
    allAvailability?.forEach((entry, index) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      console.log(`${index + 1}. ${dayNames[entry.day_of_week]} (${entry.day_of_week}): ${entry.start_time}-${entry.end_time} [Active: ${entry.is_active}] [ID: ${entry.id}]`);
    });
  }

  // 3. Check only ACTIVE entries
  console.log('\n✅ ACTIVE calendar availability entries:');
  const { data: activeAvailability, error: activeError } = await supabase
    .from('calendar_availability')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true)
    .order('day_of_week');

  if (activeError) {
    console.error('❌ Active availability error:', activeError);
  } else {
    console.log('Active entries:', activeAvailability?.length);
    activeAvailability?.forEach((entry, index) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      console.log(`${index + 1}. ${dayNames[entry.day_of_week]} (${entry.day_of_week}): ${entry.start_time}-${entry.end_time} [ID: ${entry.id}]`);
    });
  }

  // 4. Test specific day queries (Monday = 1, Wednesday = 3)
  console.log('\n🔍 Testing specific day queries:');

  for (const dayOfWeek of [1, 3]) { // Monday and Wednesday
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log(`\n${dayNames[dayOfWeek]} (${dayOfWeek}):`);

    const { data: dayAvailability, error: dayError } = await supabase
      .from('calendar_availability')
      .select('start_time, end_time, is_active, id')
      .eq('property_id', propertyId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (dayError) {
      console.error(`❌ ${dayNames[dayOfWeek]} error:`, dayError);
    } else if (!dayAvailability || dayAvailability.length === 0) {
      console.log(`❌ No active entries found for ${dayNames[dayOfWeek]}`);
    } else {
      console.log(`✅ Found ${dayAvailability.length} active entries:`);
      dayAvailability.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.start_time}-${entry.end_time} [ID: ${entry.id}]`);
      });
    }
  }
}

debugCalendarDatabase().catch(console.error);