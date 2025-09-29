-- ================================================
-- Add Property Support to Appointments Table
-- Version: 1.1
-- Created: 2025-09-28
-- ================================================

-- Add property_id column to appointments table to link appointments to properties
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS property_id TEXT;

-- Add foreign key constraint to ensure property_id references valid properties
ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_property
    FOREIGN KEY (property_id)
    REFERENCES property_calendars(property_id)
    ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_property_id
ON appointments(property_id);

-- Create index for property appointments by date
CREATE INDEX IF NOT EXISTS idx_appointments_property_date
ON appointments(property_id, start_time);

-- Update RLS policies to include property-based access
-- Enable RLS on appointments if not already enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON appointments;

-- Create comprehensive RLS policy for appointments
CREATE POLICY "Enable all access for authenticated users" ON appointments
    FOR ALL USING (auth.role() = 'authenticated');

-- Add comment to document the change
COMMENT ON COLUMN appointments.property_id IS 'References property_calendars.property_id to link appointments to specific properties';