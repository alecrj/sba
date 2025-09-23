-- Add follow-up tracking columns to appointments table
-- Run this in your Supabase SQL editor

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS followup_immediate_followup_sent boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS followup_24h_followup_sent boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS followup_3day_followup_sent boolean DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS followup_1week_followup_sent boolean DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_followup_status ON appointments(status, end_time) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_appointments_immediate_followup ON appointments(followup_immediate_followup_sent, end_time) WHERE followup_immediate_followup_sent = false;
CREATE INDEX IF NOT EXISTS idx_appointments_24h_followup ON appointments(followup_24h_followup_sent, end_time) WHERE followup_24h_followup_sent = false;
CREATE INDEX IF NOT EXISTS idx_appointments_3day_followup ON appointments(followup_3day_followup_sent, end_time) WHERE followup_3day_followup_sent = false;
CREATE INDEX IF NOT EXISTS idx_appointments_1week_followup ON appointments(followup_1week_followup_sent, end_time) WHERE followup_1week_followup_sent = false;

-- Update existing completed appointments to avoid sending retroactive follow-ups
-- (This marks existing completed appointments as already having follow-ups sent)
UPDATE appointments
SET
  followup_immediate_followup_sent = true,
  followup_24h_followup_sent = true,
  followup_3day_followup_sent = true,
  followup_1week_followup_sent = true
WHERE status = 'completed' AND end_time < NOW();

COMMENT ON COLUMN appointments.followup_immediate_followup_sent IS 'Tracks if 2-hour post-appointment follow-up email was sent';
COMMENT ON COLUMN appointments.followup_24h_followup_sent IS 'Tracks if 24-hour post-appointment follow-up email was sent';
COMMENT ON COLUMN appointments.followup_3day_followup_sent IS 'Tracks if 3-day post-appointment follow-up email was sent';
COMMENT ON COLUMN appointments.followup_1week_followup_sent IS 'Tracks if 1-week post-appointment follow-up email was sent';