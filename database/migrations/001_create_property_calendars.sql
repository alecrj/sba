-- ================================================
-- Property Calendar System - Database Migration
-- Version: 1.0
-- Created: 2025-09-27
-- ================================================

-- 1. Create Property Calendars Table
-- This table stores one record per property with calendar configuration
CREATE TABLE IF NOT EXISTS property_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL UNIQUE, -- matches existing property IDs from CalendarBooking.astro
    property_title TEXT NOT NULL,
    property_size TEXT, -- e.g., "35,000 SF"
    property_county TEXT, -- e.g., "Miami-Dade", "Broward", "Palm Beach"
    is_active BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes for performance
    CONSTRAINT property_calendars_property_id_key UNIQUE (property_id)
);

-- 2. Create Calendar Availability Table
-- This table defines when each property is available for booking
CREATE TABLE IF NOT EXISTS calendar_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER DEFAULT 30 CHECK (slot_duration > 0), -- minutes per slot
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_calendar_availability_property
        FOREIGN KEY (property_id)
        REFERENCES property_calendars(property_id)
        ON DELETE CASCADE,

    -- Ensure end time is after start time
    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- 3. Create Calendar Blocked Dates Table
-- This table stores dates/times that are blocked for booking
CREATE TABLE IF NOT EXISTS calendar_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    all_day BOOLEAN DEFAULT true,
    start_time TIME, -- only used if all_day = false
    end_time TIME,   -- only used if all_day = false
    created_by UUID, -- CRM user who blocked the date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_calendar_blocked_dates_property
        FOREIGN KEY (property_id)
        REFERENCES property_calendars(property_id)
        ON DELETE CASCADE,

    -- Ensure end time is after start time for partial day blocks
    CONSTRAINT check_partial_day_time_order
        CHECK (all_day = true OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time))
);

-- 4. Update existing appointments table to include property_id
-- This links appointments to specific properties
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS property_id TEXT;

-- Add foreign key constraint for appointments
-- Note: We'll add this after populating the property_id values
-- ALTER TABLE appointments
-- ADD CONSTRAINT fk_appointments_property
--     FOREIGN KEY (property_id)
--     REFERENCES property_calendars(property_id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_availability_property_day
    ON calendar_availability(property_id, day_of_week, is_active);

CREATE INDEX IF NOT EXISTS idx_calendar_blocked_dates_property_date
    ON calendar_blocked_dates(property_id, blocked_date);

CREATE INDEX IF NOT EXISTS idx_appointments_property_start_time
    ON appointments(property_id, start_time)
    WHERE property_id IS NOT NULL;

-- 6. Insert existing properties from CalendarBooking.astro
-- Miami-Dade County Properties
INSERT INTO property_calendars (property_id, property_title, property_size, property_county) VALUES
    ('cold-storage-miami-beach', 'Cold Storage Facility - Miami Beach, FL', '35,000 SF', 'Miami-Dade'),
    ('prime-warehouse-hialeah', 'Prime Warehouse Space - Hialeah, FL', '45,000 SF', 'Miami-Dade'),
    ('modern-distribution-center-doral', 'Modern Distribution Center - Doral, FL', '85,000 SF', 'Miami-Dade'),
    ('manufacturing-facility-miami', 'Manufacturing Facility - Miami, FL', '120,000 SF', 'Miami-Dade')
ON CONFLICT (property_id) DO NOTHING;

-- Broward County Properties
INSERT INTO property_calendars (property_id, property_title, property_size, property_county) VALUES
    ('flex-industrial-pompano', 'Flex Industrial Space - Pompano Beach, FL', '25,000 SF', 'Broward'),
    ('port-access-dania-beach', 'Port Access Facility - Dania Beach, FL', '60,000 SF', 'Broward'),
    ('distribution-warehouse-hollywood', 'Distribution Warehouse - Hollywood, FL', '75,000 SF', 'Broward'),
    ('logistics-hub-ft-lauderdale', 'Logistics Hub - Fort Lauderdale, FL', '95,000 SF', 'Broward')
ON CONFLICT (property_id) DO NOTHING;

-- Palm Beach County Properties
INSERT INTO property_calendars (property_id, property_title, property_size, property_county) VALUES
    ('industrial-complex-boca', 'Industrial Complex - Boca Raton, FL', '65,000 SF', 'Palm Beach'),
    ('multi-use-west-palm', 'Multi-Use Industrial - West Palm Beach, FL', '80,000 SF', 'Palm Beach'),
    ('distribution-center-boynton', 'Distribution Center - Boynton Beach, FL', '90,000 SF', 'Palm Beach'),
    ('tech-manufacturing-delray', 'Tech Manufacturing Hub - Delray Beach, FL', '110,000 SF', 'Palm Beach')
ON CONFLICT (property_id) DO NOTHING;

-- 7. Set default availability for all properties
-- Business hours: Monday-Friday, 9:00 AM - 4:00 PM, 30-minute slots
INSERT INTO calendar_availability (property_id, day_of_week, start_time, end_time, slot_duration)
SELECT
    pc.property_id,
    dow.day_of_week,
    '09:00:00'::TIME as start_time,
    '16:00:00'::TIME as end_time,
    30 as slot_duration
FROM property_calendars pc
CROSS JOIN (
    SELECT 1 as day_of_week UNION ALL -- Monday
    SELECT 2 UNION ALL                -- Tuesday
    SELECT 3 UNION ALL                -- Wednesday
    SELECT 4 UNION ALL                -- Thursday
    SELECT 5                          -- Friday
) dow
ON CONFLICT DO NOTHING;

-- 8. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Add triggers to automatically update updated_at timestamps
CREATE TRIGGER update_property_calendars_updated_at
    BEFORE UPDATE ON property_calendars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_availability_updated_at
    BEFORE UPDATE ON calendar_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Enable Row Level Security (RLS) for calendar tables
ALTER TABLE property_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocked_dates ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for calendar tables
-- Allow read access to property calendars for public API
CREATE POLICY "Public read access for property calendars"
    ON property_calendars FOR SELECT
    USING (is_active = true);

-- Allow read access to calendar availability for public API
CREATE POLICY "Public read access for calendar availability"
    ON calendar_availability FOR SELECT
    USING (is_active = true);

-- Allow read access to blocked dates for public API (to prevent booking)
CREATE POLICY "Public read access for blocked dates"
    ON calendar_blocked_dates FOR SELECT
    USING (true);

-- Allow full access for service role (CRM backend)
CREATE POLICY "Service role full access property calendars"
    ON property_calendars FOR ALL
    USING (true);

CREATE POLICY "Service role full access calendar availability"
    ON calendar_availability FOR ALL
    USING (true);

CREATE POLICY "Service role full access blocked dates"
    ON calendar_blocked_dates FOR ALL
    USING (true);

-- ================================================
-- Migration Complete!
--
-- Summary of what was created:
-- ✅ property_calendars - Main property calendar configuration
-- ✅ calendar_availability - Weekly schedule per property
-- ✅ calendar_blocked_dates - Blocked dates/times per property
-- ✅ Populated 12 existing properties with default business hours
-- ✅ Set up proper indexes and constraints
-- ✅ Configured Row Level Security for public API access
-- ✅ Added automatic timestamp updates
--
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify data with: SELECT * FROM property_calendars;
-- 3. Test availability with: SELECT * FROM calendar_availability LIMIT 10;
-- ================================================