# Civic Connect Mail Service - Implementation Guide

## Overview

The mail service has been fully integrated into Civic Connect to send notification emails to citizens when their reported issues are resolved by authorities.

## 🎯 How It Works

1. **Citizen reports an issue** - User submits a civic issue from the Citizen Dashboard
2. **Authority resolves the issue** - Authority marks the issue as "Resolved" in the Authority Dashboard
3. **Resolution form appears** - Authority fills in optional resolution details and message
4. **Email notification sent** - Citizen receives an email with:
   - Confirmation that their issue is resolved
   - Issue details
   - Authority's resolution details (if provided)
   - Personal message from authority (if provided)

## 📧 Email Templates

### Issue Resolved
- **Subject**: ✅ Your Report Has Been Resolved - [Issue Title]
- **Content**: Professional HTML email with issue details, resolution information, and call-to-action button
- **Triggers**: When status changes to "resolved"

## 🔧 Setup Instructions

### Step 1: Choose Email Provider

The mail service supports multiple providers. Choose one based on your needs:

#### Option A: SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com
2. Get your API key from Settings > API Keys
3. Update `.env`:
   ```
   VITE_MAIL_ENABLED=true
   VITE_MAIL_PROVIDER=sendgrid
   VITE_MAIL_API_KEY=your_sendgrid_api_key_here
   VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
   VITE_MAIL_FROM_NAME=Civic Connect
   VITE_APP_URL=https://yourapp.com
   ```

#### Option B: Mailgun
1. Sign up at https://www.mailgun.com
2. Get your API key and domain
3. Update `.env`:
   ```
   VITE_MAIL_ENABLED=true
   VITE_MAIL_PROVIDER=mailgun
   VITE_MAIL_API_KEY=your_mailgun_api_key_here
   VITE_MAILGUN_DOMAIN=mg.yourdomain.com
   VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
   VITE_MAIL_FROM_NAME=Civic Connect
   VITE_APP_URL=https://yourapp.com
   ```

#### Option C: Nodemailer (Self-hosted Backend)
1. Set up a Node.js backend with Nodemailer
2. Create an endpoint: `POST /api/mail/send`
3. Update `.env`:
   ```
   VITE_MAIL_ENABLED=true
   VITE_MAIL_PROVIDER=nodemailer
   VITE_API_URL=http://localhost:3001
   VITE_MAIL_FROM_NAME=Civic Connect
   VITE_APP_URL=http://localhost:5173
   ```

### Step 2: Configure Email Provider

For SendGrid:
- Create a sender identity (Settings > Sender Authentication)
- Verify your sender email domain
- Update `VITE_MAIL_FROM_EMAIL` with verified email

### Step 3: Restart Application

After updating `.env`:
```bash
# Stop the development server (Ctrl+C)
# Restart it
npm run dev
```

### Step 4: Test the Setup

1. Sign in as a citizen
2. Report an issue
3. Sign out and sign in as authority
4. Mark the issue as "Resolved"
5. Fill in resolution details (optional)
6. Click "Confirm & Send Notification"
7. Check citizen's email for notification

## 📝 Feature Details

### Authority Dashboard Changes

The Authority Dashboard now has enhanced issue resolution capabilities:

#### Resolution Form
When marking an issue as "Resolved", authorities can:

1. **Resolution Summary** - Describe what was done to fix the issue
   - Optional field
   - Included in the email notification
   - Helps citizens understand the resolution

2. **Message to Citizen** - Personal message from authority
   - Optional field
   - Appears in email with "Message from Authority:" prefix
   - Humanizes the resolution process

#### Example Resolution Flow
```
Authority Clicks "Resolved" Button
    ↓
Resolution Form Appears
    ↓
Authority fills:
  - Resolution Summary: "Pothole filled with asphalt"
  - Message: "Thank you for reporting! This was fixed as part of our Q1 maintenance."
    ↓
Authority Clicks "Confirm & Send Notification"
    ↓
✅ Issue marked as Resolved
✅ Email sent to citizen
✅ Modal closes
```

## 🔌 API Integration

### Mail Service Methods

#### Send Issue Resolved Notification
```typescript
import { getMailService } from '@/services/mailServiceInit';

const mailService = getMailService();
const sent = await mailService.sendIssueResolvedNotification(
  userId,
  {
    title: "Pothole at Main Street",
    description: "Large pothole causing traffic issues",
    category: "Road / Pothole",
    location: "123 Main Street",
    resolutionDetails: "Pothole filled with asphalt",
    resolvedMessage: "Thank you for reporting!"
  }
);
```

#### Send Issue In Progress Notification (Optional)
```typescript
const sent = await mailService.sendIssueInProgressNotification(
  userId,
  {
    title: "Pothole at Main Street",
    category: "Road / Pothole",
    location: "123 Main Street"
  }
);
```

#### Test Mail Configuration
```typescript
const success = await mailService.testConnection('test@example.com');
```

## 🔐 Security Considerations

1. **API Keys**: Store API keys in `.env` file (never commit to git)
2. **User Privacy**: Email addresses only retrieved from Supabase auth
3. **Error Handling**: Failed emails don't block issue resolution
4. **Rate Limiting**: Consider provider's rate limits for bulk operations

## 📊 Environment Variables Reference

```env
# Enable/disable mail service
VITE_MAIL_ENABLED=true

# Email provider (sendgrid, mailgun, nodemailer)
VITE_MAIL_PROVIDER=sendgrid

# API credentials for chosen provider
VITE_MAIL_API_KEY=your_api_key_here

# Email configuration
VITE_MAIL_FROM_EMAIL=noreply@civicconnect.local
VITE_MAIL_FROM_NAME=Civic Connect

# Optional for Mailgun
VITE_MAILGUN_DOMAIN=mg.yourdomain.com

# Optional for Nodemailer backend
VITE_API_URL=http://localhost:3001

# Application URL for email links
VITE_APP_URL=http://localhost:5173
```

## 🧪 Testing Locally

### Without Real Email Provider
If you don't have an email provider configured, the mail service accepts the request gracefully:
- Issue status still updates
- Email logs appear in browser console
- No actual email is sent

### With Real Email Provider
1. Create test user accounts (citizen + authority)
2. Report an issue
3. Resolve it with authority account
4. Check email client for notification

## 📧 Email Content Customization

To customize email templates, edit `/src/services/emailTemplates.ts`:

```typescript
emailTemplates.issueResolved = (data: EmailTemplateData) => {
  // Modify HTML and text templates here
  return {
    subject: 'Custom subject',
    html: '<custom-html>',
    text: 'custom-text'
  };
};
```

## ⚙️ Advanced Configuration

### Using Supabase Edge Functions (Alternative)

For Supabase users, an alternative is to use Supabase Edge Functions:

1. Create a Supabase function: `send-email`
2. Configure the function to use your email provider
3. Update mail service to call the function instead

### Batch Email Operations

The mail service supports batch email sending:

```typescript
const results = await mailService.sendBatchEmail(
  [userId1, userId2, userId3],
  {
    subject: 'Community Alert',
    html: '<html-content>',
    text: 'text-content'
  }
);

console.log(`Sent: ${results.success}, Failed: ${results.failed}`);
```

## 🐛 Troubleshooting

### Emails Not Sending

**Check 1**: Mail service enabled
```typescript
// In browser console
import { getMailService } from '@/services/mailServiceInit';
const ms = getMailService();
console.log(ms.getConfig());
```

**Check 2**: API key is valid
- Verify key in provider dashboard
- Check for typos in `.env`

**Check 3**: From email is verified
- SendGrid: verify sender domain
- Mailgun: verify sender domain

**Check 4**: Check browser console for errors
- Look for error messages from mail service

### User Email Not Found

- Verify user has an email in Supabase auth
- Check user profile exists in `profiles` table
- Verify full_name is set (for greeting personalization)

### Email Template Issues

- Check email client spam folder
- Verify HTML syntax in template
- Test with simple text email first

## 📚 Further Resources

- [SendGrid - Email API Documentation](https://docs.sendgrid.com/)
- [Mailgun - Email API Documentation](https://documentation.mailgun.com/)
- [Nodemailer - Documentation](https://nodemailer.com/about/)

## ✅ Checklist for Production

- [ ] Email provider account created and verified
- [ ] API key generated and stored securely
- [ ] `.env` configured with provider details
- [ ] Sender domain verified with email provider
- [ ] Test email sent successfully
- [ ] User privacy policy updated (mention emails sent on status change)
- [ ] Email template customized with branding
- [ ] Error handling and monitoring set up
- [ ] Rate limiting considered

## 📝 Code Files Modified

1. **src/services/mailServiceInit.ts** (NEW)
   - Mail service initialization utility
   - Configures provider based on env variables

2. **src/hooks/useIssues.tsx** (MODIFIED)
   - Added mail service integration
   - Sends notification when issue marked as resolved
   - Supports resolution details and personal message

3. **src/pages/AuthorityDashboard.tsx** (MODIFIED)
   - Added resolution form UI
   - Captures resolution details and message
   - Shows confirmation before sending

4. **src/App.tsx** (MODIFIED)
   - Initializes mail service on app startup

5. **.env** (MODIFIED)
   - Enabled mail service configuration

## 🚀 Next Steps

1. Choose and set up an email provider
2. Update `.env` with provider credentials
3. Restart the development server
4. Test the complete flow (citizen reports → authority resolves → email sent)
5. Customize email templates with your branding
6. Deploy to production with environment variables
