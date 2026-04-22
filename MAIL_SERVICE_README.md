# Civic Connect Mail Service

A complete email notification system for Civic Connect that sends automated emails to users when their reported issues are resolved or updated.

## 📋 Features

- **Issue Resolution Notifications**: Automatically email users when their reported issues are marked as resolved
- **Status Update Notifications**: Notify users when issues move to "in progress"
- **Multiple Email Providers**: Support for SendGrid, Mailgun, Nodemailer, and Supabase Edge Functions
- **Email Templates**: Professional HTML and text email templates
- **Email Logging**: Track all sent emails with status and error logging
- **Resend Failed Emails**: Admin dashboard to resend failed email notifications
- **Batch Email Support**: Send emails to multiple users
- **Easy Integration**: Simple hooks and utilities for integration

## 🚀 Quick Start

### 1. Choose an Email Provider

Select one of these options:

#### Option A: SendGrid (Recommended - Easiest)
```bash
# 1. Sign up at https://sendgrid.com
# 2. Create API key in Settings > API Keys
# 3. Verify sender identity
# 4. Add to .env:
VITE_MAIL_ENABLED=true
VITE_MAIL_PROVIDER=sendgrid
VITE_MAIL_API_KEY=SG.xxxxxx_your_api_key_xxxxx
VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
VITE_MAIL_FROM_NAME=Civic Connect
```

#### Option B: Mailgun
```bash
# 1. Sign up at https://www.mailgun.com
# 2. Verify domain
# 3. Get API key
# 4. Add to .env:
VITE_MAIL_ENABLED=true
VITE_MAIL_PROVIDER=mailgun
VITE_MAIL_API_KEY=your_mailgun_api_key
VITE_MAILGUN_DOMAIN=mg.yourdomain.com
VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
```

#### Option C: Nodemailer (Self-Hosted Backend)
```bash
# Create a backend service (see BACKEND_EMAIL_SERVICE_EXAMPLE.md)
VITE_MAIL_ENABLED=true
VITE_MAIL_PROVIDER=nodemailer
VITE_API_URL=http://localhost:3001
```

#### Option D: Supabase Edge Functions
```bash
# Deploy Edge Function
supabase functions new send-email
# See supabase/functions/send-email-function.ts for code
```

### 2. Set Up Database

Run the SQL migration to create email logging table:

```sql
-- In Supabase SQL Editor, run: supabase/migrations/email_logs_setup.sql
-- This creates the email_logs table and related indexes
```

Or manually in Supabase:

```bash
supabase db push
```

### 3. Initialize Mail Service in Your App

In `src/main.tsx`:

```tsx
import { initializeMailService } from '@/services/mailServiceIntegration';

// Initialize mail service on app startup
initializeMailService();

// Create root element
const root = document.getElementById('root')!
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 4. Integrate with Issue Status Updates

Update your `useIssues.tsx` hook:

```tsx
import { notifyIssueResolved, notifyIssueInProgress } from '@/services/mailServiceIntegration';

const updateIssueStatus = async (id: string, status: string, assignedTo?: string) => {
  const issueToUpdate = issues.find(i => i.id === id);
  
  // ... existing update code ...

  if (status === 'resolved' && issueToUpdate) {
    await notifyIssueResolved(issueToUpdate.user_id, id, {
      title: issueToUpdate.title,
      description: issueToUpdate.description,
      category: issueToUpdate.category,
      address: issueToUpdate.address || 'Unknown Location',
      resolutionDetails: 'Your issue has been resolved.',
    });
  }
};
```

### 5. Test Email Configuration

Create a test button in your admin panel:

```tsx
import { getMailService } from '@/services/mailServiceIntegration';

async function testEmail() {
  const mailService = getMailService();
  const success = await mailService.testConnection('test@example.com');
  
  if (success) {
    toast.success('Test email sent!');
  } else {
    toast.error('Failed to send test email');
  }
}
```

## 📁 File Structure

```
src/services/
├── mailService.ts                 # Core mail service (supports multiple providers)
├── emailTemplates.ts              # Professional email templates
└── mailServiceIntegration.ts      # Integration utilities and hooks

supabase/
├── migrations/
│   └── email_logs_setup.sql      # Database setup for email logging
└── functions/
    └── send-email-function.ts    # Supabase Edge Function option

Documentation:
├── MAIL_SERVICE_SETUP.md         # Complete setup guide
├── MAIL_SERVICE_INTEGRATION_EXAMPLES.md  # Integration examples
├── BACKEND_EMAIL_SERVICE_EXAMPLE.md     # Node.js backend setup
└── MAIL_SERVICE_README.md        # This file
```

## 🔧 Core Components

### MailService Class
Main service for sending emails with provider abstraction.

```tsx
import MailService from '@/services/mailService';

const mailService = MailService.getInstance();

// Send issue resolved notification
await mailService.sendIssueResolvedNotification(userId, {
  title: 'Pothole Fixed',
  description: 'Reported pothole on Main Street',
  category: 'pothole',
  location: 'Main St & 5th Ave',
  resolutionDetails: 'Road repaired and inspected',
});
```

### Integration Functions
Easy-to-use functions for common operations.

```tsx
import { 
  notifyIssueResolved, 
  notifyIssueInProgress,
  resendFailedEmail 
} from '@/services/mailServiceIntegration';

// Send notification when issue is resolved
await notifyIssueResolved(userId, issueId, issueData);

// Send notification when issue enters progress
await notifyIssueInProgress(userId, issueId, issueData);

// Resend a failed email
await resendFailedEmail(emailLogId);
```

## 📧 Email Templates

Two professional templates included:

### Issue Resolved Email
- Clean, branded header
- Issue details summary
- Resolution information
- Call-to-action button
- Professional footer

### Issue In Progress Email
- Status update notification
- Issue details
- Reassurance message
- Timeline expectations

Both templates have HTML and plain text versions for compatibility.

## 📊 Monitoring & Admin Dashboard

### Email Logs Table

Automatically tracks:
- Email type and recipient
- Send status (pending, success, failed, bounced)
- Error messages
- Number of send attempts
- Timestamps

### Admin Dashboard Example

See `MAIL_SERVICE_INTEGRATION_EXAMPLES.md` for a complete admin dashboard component to:
- View email sending history
- Track success/failure rates
- Resend failed emails
- Monitor email performance

## 🔐 Security

- API keys stored in environment variables only
- User email addresses fetched securely from Supabase auth
- CORS configured for frontend-to-backend communication
- RLS policies on email_logs table
- No sensitive data logged in error messages

## 🚨 Troubleshooting

### Email not sending?

1. **Check configuration**
   ```tsx
   const mailService = getMailService();
   console.log(mailService.getConfig());
   ```

2. **Verify API key**
   - SendGrid: Check in Settings > API Keys
   - Mailgun: Check in domain settings
   - Nodemailer: Check email service credentials

3. **Check browser console**
   - Look for error messages
   - Check XSRF tokens if CORS issues

4. **Review email logs**
   - Check Supabase email_logs table
   - Look for error_message field

### Provider-specific issues

**SendGrid:**
- Verify email domain/identity in Sender Identity settings
- Check API key permissions (Mail Send access required)
- Ensure from email matches verified sender

**Mailgun:**
- Verify domain DNS records are correct
- Check API key is active
- Ensure domain is verified

**Nodemailer:**
- Test backend service is running: `curl http://localhost:3001/api/health`
- Check backend logs for errors
- Verify network connectivity between frontend and backend

## 📖 Environment Variables Reference

```bash
# Enable/disable mail service
VITE_MAIL_ENABLED=true|false

# Email provider
VITE_MAIL_PROVIDER=sendgrid|mailgun|nodemailer|supabase

# SendGrid specific
VITE_MAIL_API_KEY=SG.xxxxx

# Mailgun specific
VITE_MAIL_API_KEY=key-xxxxx
VITE_MAILGUN_DOMAIN=mg.example.com

# Email configuration
VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
VITE_MAIL_FROM_NAME=Civic Connect

# Nodemailer backend
VITE_API_URL=http://localhost:3001

# Application
VITE_APP_URL=http://localhost:5173
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Manual Testing
1. Set `VITE_MAIL_ENABLED=true` in `.env`
2. Click "Send Test Email" button in admin panel
3. Verify email received
4. Check email_logs table in Supabase

### Load Testing
Use batch email endpoint to send to multiple users:
```tsx
const mailService = getMailService();
await mailService.sendBatchEmail(userIds, emailTemplate);
```

## 🎯 Best Practices

1. **Always test configuration** before going live
2. **Monitor email_logs table** for failures
3. **Set up alerts** for failed emails
4. **Use environment variables** for all credentials
5. **Implement retry logic** for failed emails
6. **Schedule email digest** emails during low traffic periods
7. **Monitor sending rates** (avoid hitting provider limits)
8. **Keep user preferences** in mind (unsubscribe options)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review example code in `MAIL_SERVICE_INTEGRATION_EXAMPLES.md`
3. Check provider documentation
4. Review browser console for errors

## 📝 License

Part of civic Connect project
