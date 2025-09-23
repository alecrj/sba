# Complete Appointment System Setup Guide

## Overview
This guide covers the complete setup of the appointment booking and notification system that connects your website to your CRM with automated reminders and follow-ups.

## System Components

### 1. Website Integration
- **CalendarBooking.astro**: Appointment booking form component
- **Process-appointment function**: Handles form submissions and creates CRM records

### 2. CRM Dashboard
- **Appointments page**: Manage all appointments with filtering and status updates
- **Analytics dashboard**: View appointment metrics and performance data
- **Rescheduling interface**: Modify appointment times with automatic notifications

### 3. Notification System
- **Confirmation emails**: Immediate notifications when appointments are booked
- **Reminder emails**: 24-hour and 2-hour automated reminders
- **Follow-up sequences**: Post-appointment email sequences
- **Rescheduling notifications**: Updates when appointments are changed

### 4. Calendar Integration
- **Google Calendar sync**: Automatic calendar event creation and updates
- **Calendar invites**: .ics file attachments in confirmation emails

## Database Setup

### Required Tables
Your Supabase database needs these tables with the following key columns:

#### Appointments Table
```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  status text DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
  attendees text[],
  reminder_24h_sent boolean DEFAULT false,
  reminder_2h_sent boolean DEFAULT false,
  followup_immediate_followup_sent boolean DEFAULT false,
  followup_24h_followup_sent boolean DEFAULT false,
  followup_3day_followup_sent boolean DEFAULT false,
  followup_1week_followup_sent boolean DEFAULT false,
  google_calendar_event_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Leads Table
```sql
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  status text DEFAULT 'new',
  priority text DEFAULT 'medium',
  -- ... other lead fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Lead Activities Table
```sql
CREATE TABLE lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  activity_type text NOT NULL, -- note, email, call, meeting, etc.
  title text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

## Environment Variables

### Required Environment Variables
Set these in your Netlify environment variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (Current SMTP)
SMTP_USER=your_email@domain.com
SMTP_PASS=your_app_password

# Google Calendar Integration
GOOGLE_PROJECT_ID=your_google_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
GOOGLE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CALENDAR_ID=your_calendar_id_or_primary

# Site Configuration
URL=https://your-site.netlify.app
```

## Netlify Functions

### Core Functions
1. **process-appointment.js** - Handles new appointment bookings
2. **send-appointment-confirmation.js** - Sends confirmation emails
3. **send-appointment-reminders.js** - Manual reminder sending
4. **scheduled-reminders.js** - Automated reminder checking (CRON)
5. **reschedule-appointment.js** - Handles appointment rescheduling
6. **automated-followups.js** - Post-appointment follow-up sequences
7. **google-calendar-sync.js** - Google Calendar integration

### Function Dependencies
Install required npm packages:
```bash
cd your-website-directory
npm install @supabase/supabase-js nodemailer googleapis
```

## Google Calendar Setup

### 1. Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create service account credentials
5. Download the JSON key file
6. Extract values for environment variables

### 2. Calendar Permissions
1. Share your Google Calendar with the service account email
2. Give "Make changes to events" permission
3. Note the Calendar ID from calendar settings

## Automated Scheduling

### CRON Jobs Setup
Set up automated functions to run periodically:

#### Option 1: Netlify Scheduled Functions (Recommended)
Create `netlify.toml`:
```toml
[build]
  functions = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-scheduled-functions"

# Run reminder checks every hour
[functions.scheduled-reminders]
  schedule = "0 * * * *"

# Run follow-up checks every 4 hours
[functions.automated-followups]
  schedule = "0 */4 * * *"
```

#### Option 2: External CRON Service
Use services like [cron-job.org](https://cron-job.org) to call your functions:
- **Reminders**: `POST https://your-site.netlify.app/.netlify/functions/scheduled-reminders`
- **Follow-ups**: `POST https://your-site.netlify.app/.netlify/functions/automated-followups`

## CRM Integration

### Admin Access
The CRM requires admin authentication. Ensure your user role system is set up:

1. **AuthContext** - User authentication
2. **UserRoleContext** - Role-based access control
3. **Admin routes** - Protected appointment management pages

### Key CRM Features
- View all appointments with filtering
- Change appointment statuses
- Send manual reminders
- Reschedule appointments
- View analytics and metrics
- Access individual lead records

## Testing Checklist

### Initial Setup Testing
- [ ] Database tables created with all required columns
- [ ] Environment variables set correctly
- [ ] All Netlify functions deploy without errors
- [ ] Google Calendar API credentials working
- [ ] Email SMTP configuration working

### Booking Flow Testing
- [ ] Website appointment form submits successfully
- [ ] New lead created in CRM
- [ ] New appointment appears in CRM
- [ ] Confirmation email sent to client
- [ ] Confirmation email sent to business
- [ ] Google Calendar event created
- [ ] Activity logged in lead record

### Reminder System Testing
- [ ] Manual reminder sending works
- [ ] Automatic reminders trigger correctly
- [ ] Reminder flags update in database
- [ ] Email templates render properly

### Rescheduling Testing
- [ ] Reschedule form works in CRM
- [ ] Appointment times update correctly
- [ ] Rescheduling notifications sent
- [ ] Google Calendar events updated
- [ ] Reminder flags reset appropriately

### Follow-up Testing
- [ ] Follow-up sequences trigger after completion
- [ ] Different follow-up types send at correct intervals
- [ ] Follow-up flags prevent duplicate sending
- [ ] Email templates are professional and branded

## Troubleshooting

### Common Issues

#### Emails Not Sending
- Check SMTP credentials
- Verify email provider allows SMTP
- Check for rate limiting
- Review function logs in Netlify

#### Google Calendar Not Working
- Verify service account permissions
- Check calendar sharing settings
- Validate private key format
- Ensure Calendar API is enabled

#### Database Errors
- Confirm table structure matches schema
- Check RLS (Row Level Security) policies
- Verify Supabase connection credentials
- Review function logs for SQL errors

#### CRM Access Issues
- Check user authentication system
- Verify admin role assignments
- Review protected route configurations
- Check session management

## Monitoring and Maintenance

### Regular Checks
- Monitor email delivery rates
- Review appointment completion rates
- Check for failed reminder sending
- Verify Google Calendar sync status

### Log Monitoring
- Netlify function logs for errors
- Supabase logs for database issues
- Email service logs for delivery status

### Performance Optimization
- Monitor function execution times
- Optimize database queries
- Review email template sizes
- Check for memory leaks in long-running processes

## Upgrade Paths

### Email Service Upgrade
See `EMAIL_AUTHENTICATION_UPGRADE.md` for moving from SMTP to professional email services like SendGrid.

### Advanced Features
- SMS notifications (Twilio integration)
- Video call scheduling (Zoom/Teams integration)
- Advanced analytics and reporting
- Multi-location appointment management
- Appointment waitlist management

## Support and Documentation

### Function Documentation
Each Netlify function includes inline comments explaining:
- Purpose and functionality
- Required parameters
- Error handling
- Database interactions
- External service integrations

### Database Schema
Refer to the migration files in `/database/migrations/` for complete table structures and relationships.

### API Endpoints
All functions are accessible via:
`https://your-site.netlify.app/.netlify/functions/function-name`

This complete system provides a professional appointment booking experience with automated notifications, CRM integration, and comprehensive management tools.