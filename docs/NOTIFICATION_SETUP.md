# Notification System Setup Guide

## ✅ **System Upgraded to Resend (No Client Passwords Required!)**

The notification system has been upgraded to use **Resend API** instead of SMTP, which means:
- **No need for client email passwords**
- **Better email deliverability**
- **Professional email sending**
- **Simple setup with just an API key**

## 🔧 **Required Environment Variables**

Set these in **Netlify Dashboard > Site Settings > Environment Variables**:

### **📧 Email Configuration (Resend)**
```bash
# Resend API Configuration (Primary - Required)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_FROM_NAME=Your Business Name

# Notification recipient
NOTIFICATION_EMAIL=your-business-email@domain.com
```

### **📊 Lead Storage (GitHub Integration)**
```bash
# GitHub Configuration for lead storage
GITHUB_TOKEN=github_pat_your_token_here
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-repo-name
GITHUB_BRANCH=main
```

### **📅 Appointment System (Optional - For Follow-ups)**
```bash
# Supabase Configuration for appointments and follow-ups
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 **Quick Setup for New Clients**

### **Step 1: Get Resend API Key**
1. Go to [resend.com](https://resend.com) and create account
2. Add and verify your domain (or use default for testing)
3. Generate API key in dashboard
4. Copy the API key (starts with `re_`)

### **Step 2: Configure Netlify Environment Variables**
1. Go to **Netlify Dashboard** → Your Site → **Site Settings** → **Environment Variables**
2. Add the following variables:

| Variable Name | Value | Example |
|---------------|-------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_AbCd1234_XYZ...` |
| `RESEND_FROM_EMAIL` | Your verified sender email | `noreply@yourdomain.com` |
| `RESEND_FROM_NAME` | Your business name | `Acme Real Estate` |
| `NOTIFICATION_EMAIL` | Where to receive lead alerts | `info@yourbusiness.com` |

### **Step 3: Test the System**
After deployment, test by submitting a contact form on your website.

## 📋 **What the System Does**

### **1. Immediate Lead Notifications**
When someone submits a contact form:
- ✅ **Client notification** sent to your `NOTIFICATION_EMAIL`
- ✅ **Auto-response** sent to the prospect thanking them
- ✅ **Lead saved** to GitHub for CRM tracking

### **2. Automated Follow-up Sequences**
After appointments (if Supabase is configured):
- ✅ **2 hours**: Thank you email
- ✅ **24 hours**: Next steps and follow-up scheduling
- ✅ **3 days**: Check-in with questions
- ✅ **1 week**: Weekly check-in with help offers

### **3. Appointment Management**
- ✅ **Appointment confirmations** when bookings are made
- ✅ **Appointment reminders** before meetings
- ✅ **Reschedule notifications** when changes occur

## 🎯 **Benefits of Resend vs SMTP**

| Feature | Old SMTP | New Resend |
|---------|----------|------------|
| **Client Passwords** | ❌ Required | ✅ Not needed |
| **Setup Complexity** | ❌ High | ✅ Simple |
| **Deliverability** | ❌ Variable | ✅ Excellent |
| **Security** | ❌ Passwords exposed | ✅ API key only |
| **Professional** | ❌ Personal emails | ✅ Business domain |
| **Analytics** | ❌ None | ✅ Built-in tracking |

## 🔧 **Functions Updated**

The following Netlify functions now use Resend:
- ✅ `send-notification-email.js` - Lead notifications and auto-responses
- ✅ `automated-followups.js` - Appointment follow-up sequences
- ✅ `send-appointment-reminders.js` - Appointment notifications
- ✅ `send-appointment-confirmation.js` - Booking confirmations

## 🧪 **Testing**

### **Test Lead Submission**
```bash
curl -X POST https://yoursite.netlify.app/.netlify/functions/send-notification-email \
  -H "Content-Type: application/json" \
  -d '{
    "leadData": {
      "name": "Test Lead",
      "email": "test@example.com",
      "phone": "555-123-4567",
      "company": "Test Company",
      "warehouse_interest": "25,000 SF Distribution",
      "budget_range": "$10-15/SF",
      "timeline": "ASAP",
      "message": "Test inquiry",
      "source": "website_test"
    },
    "leadId": "test-123",
    "type": "notification"
  }'
```

### **Expected Result**
- ✅ Email sent to your `NOTIFICATION_EMAIL`
- ✅ Auto-response sent to test@example.com
- ✅ No errors in Netlify function logs

## 🚨 **Troubleshooting**

### **"Missing API key" Error**
- Check `RESEND_API_KEY` is set in Netlify environment variables
- Verify API key starts with `re_`
- Redeploy site after adding environment variables

### **"Domain not verified" Error**
- Verify your domain in Resend dashboard
- Or use `onboarding@resend.dev` for testing (included by default)

### **Emails not arriving**
- Check spam folder
- Verify `NOTIFICATION_EMAIL` is correct
- Check Netlify function logs for errors

## 📞 **Support**

For technical issues:
1. Check Netlify function logs
2. Verify all environment variables are set
3. Test with the curl command above
4. Check Resend dashboard for delivery status

**The system is now client-friendly - no passwords required!** 🎉