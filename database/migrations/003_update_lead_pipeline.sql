-- ================================================
-- Update Lead Pipeline Structure
-- Version: 1.2
-- Created: 2025-09-28
-- ================================================

-- 1. Add new columns to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS lead_score TEXT CHECK (lead_score IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS property_id TEXT;

-- 2. Add foreign key constraint for property_id
ALTER TABLE leads
ADD CONSTRAINT fk_leads_property
    FOREIGN KEY (property_id)
    REFERENCES property_calendars(property_id)
    ON DELETE SET NULL;

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);

-- 4. Update status values to new pipeline stages
-- Map old statuses to new ones
UPDATE leads SET status = 'tour-scheduled' WHERE status = 'qualified';
UPDATE leads SET status = 'showing-completed' WHERE status = 'proposal-sent';
UPDATE leads SET status = 'won' WHERE status = 'closed-won';
UPDATE leads SET status = 'lost' WHERE status = 'closed-lost';
UPDATE leads SET status = 'new' WHERE status = 'contacted';

-- 5. Set default lead scores based on existing data
UPDATE leads SET lead_score =
    CASE
        WHEN priority = 'urgent' THEN 'high'
        WHEN priority = 'high' THEN 'high'
        WHEN priority = 'medium' THEN 'medium'
        WHEN priority = 'low' THEN 'low'
        ELSE 'medium'
    END
WHERE lead_score IS NULL;

-- 6. Update constraint on status column to reflect new values
-- First, drop the existing check constraint if it exists
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Add new constraint with updated status values
ALTER TABLE leads
ADD CONSTRAINT leads_status_check
CHECK (status IN ('new', 'tour-scheduled', 'canceled-no-show', 'showing-completed', 'won', 'lost'));

-- 7. Update appointments to automatically move leads to "tour-scheduled" status
-- When an appointment is created for a lead, move them to tour-scheduled
-- This will be handled in the application code, but we can set existing appointments

-- Move leads to tour-scheduled if they have active appointments
UPDATE leads
SET status = 'tour-scheduled'
WHERE status = 'new'
AND id IN (
    SELECT DISTINCT lead_id
    FROM appointments
    WHERE lead_id IS NOT NULL
    AND status IN ('scheduled', 'confirmed')
    AND start_time > NOW()
);

-- 8. Add comments for documentation
COMMENT ON COLUMN leads.lead_score IS 'Lead scoring: low, medium, high based on engagement and potential';
COMMENT ON COLUMN leads.property_id IS 'References specific property calendar for property-specific tours';

-- 9. Create a function to automatically update lead status based on appointment status
CREATE OR REPLACE FUNCTION update_lead_status_on_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When an appointment is created, move lead to tour-scheduled
    IF TG_OP = 'INSERT' AND NEW.lead_id IS NOT NULL THEN
        UPDATE leads
        SET status = 'tour-scheduled'
        WHERE id = NEW.lead_id
        AND status = 'new';
    END IF;

    -- When an appointment is cancelled, move lead to canceled-no-show
    IF TG_OP = 'UPDATE' AND NEW.lead_id IS NOT NULL THEN
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            UPDATE leads
            SET status = 'canceled-no-show'
            WHERE id = NEW.lead_id
            AND status = 'tour-scheduled';
        END IF;

        -- When an appointment is completed, move lead to showing-completed
        IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
            UPDATE leads
            SET status = 'showing-completed'
            WHERE id = NEW.lead_id
            AND status = 'tour-scheduled';
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to automatically update lead status
DROP TRIGGER IF EXISTS trigger_update_lead_status ON appointments;
CREATE TRIGGER trigger_update_lead_status
    AFTER INSERT OR UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_status_on_appointment_change();

-- 11. Update the public appointment booking API to set leads to tour-scheduled
-- This will be handled in the application code when appointments are created from website

COMMENT ON FUNCTION update_lead_status_on_appointment_change() IS 'Automatically updates lead status based on appointment changes';