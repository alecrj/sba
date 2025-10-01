-- Add Monday and Wednesday availability for the test property
-- Property ID: c21cdd24-bfcd-4cec-bff0-9aae187cac1b
-- Monday = 1, Wednesday = 3, Friday = 5

-- Add Monday availability
INSERT INTO calendar_availability (
  property_id,
  day_of_week,
  start_time,
  end_time,
  slot_duration,
  is_active
) VALUES (
  'c21cdd24-bfcd-4cec-bff0-9aae187cac1b',
  1,  -- Monday
  '09:00:00',
  '17:00:00',
  30,
  true
) ON CONFLICT (property_id, day_of_week) DO UPDATE SET
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  is_active = EXCLUDED.is_active;

-- Add Wednesday availability
INSERT INTO calendar_availability (
  property_id,
  day_of_week,
  start_time,
  end_time,
  slot_duration,
  is_active
) VALUES (
  'c21cdd24-bfcd-4cec-bff0-9aae187cac1b',
  3,  -- Wednesday
  '09:00:00',
  '17:00:00',
  30,
  true
) ON CONFLICT (property_id, day_of_week) DO UPDATE SET
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  is_active = EXCLUDED.is_active;