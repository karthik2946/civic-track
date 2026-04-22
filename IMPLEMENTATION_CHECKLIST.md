# Civic Connect Mail Service - Implementation Checklist

Follow these steps to implement the mail service in your Civic Connect application.

## Phase 1: Setup & Configuration

### Step 1: Choose Your Email Provider
- [ ] Read through the provider options in `MAIL_SERVICE_README.md`
- [ ] Choose a provider:
  - [ ] SendGrid (recommended - easiest)
  - [ ] Mailgun
  - [ ] Nodemailer (self-hosted backend)
  - [ ] Supabase Edge Functions

### Step 2: Set Up Email Provider Account
#### If using SendGrid:
- [ ] Sign up at https://sendgrid.com
- [ ] Create an API key in Settings > API Keys
- [ ] Add sender email/domain in "Sender Authentication"
- [ ] Copy API key

#### If using Mailgun:
- [ ] Sign up at https://www.mailgun.com
- [ ] Create an account and add your domain
- [ ] Verify domain DNS records
- [ ] Get API key from dashboard
- [ ] Copy API key and domain

#### If using Nodemailer:
- [ ] Set up backend service (follow `BACKEND_EMAIL_SERVICE_EXAMPLE.md`)
- [ ] Install dependencies: `npm install express nodemailer cors dotenv`
- [ ] Create `.env` with mail credentials
- [ ] Start backend service on port 3001

### Step 3: Add Environment Variables
- [ ] Copy these to your `.env` file:
```
VITE_MAIL_ENABLED=true
VITE_MAIL_PROVIDER=sendgrid    # or mailgun/nodemailer
VITE_MAIL_API_KEY=your_api_key_here
VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
VITE_MAIL_FROM_NAME=Civic Connect
VITE_APP_URL=http://localhost:5173
```

## Phase 2: Database Setup

### Step 4: Create Email Logs Table
- [ ] Go to Supabase dashboard
- [ ] Open SQL Editor
- [ ] Copy contents of `supabase/migrations/email_logs_setup.sql`
- [ ] Paste and run the SQL
- [ ] Verify table was created: `email_logs`

OR

- [ ] Run: `supabase db push` from terminal

### Step 5: Verify Database
- [ ] In Supabase, check that this table exists:
  - [ ] `email_logs` table is present
  - [ ] Has columns: id, user_id, issue_id, email_type, status, etc.
  - [ ] Indexes are created

## Phase 3: Frontend Integration

### Step 6: File Structure Verification
- [ ] Verify these files exist (created by the mail service setup):
  - [ ] `src/services/mailService.ts`
  - [ ] `src/services/emailTemplates.ts`
  - [ ] `src/services/mailServiceIntegration.ts`

### Step 7: Initialize Mail Service in App
- [ ] Open `src/main.tsx`
- [ ] Add import: `import { initializeMailService } from '@/services/mailServiceIntegration';`
- [ ] Call `initializeMailService()` before React renders
- [ ] Test in browser console for initialization message

### Step 8: Update useIssues Hook
- [ ] Open `src/hooks/useIssues.tsx`
- [ ] Add import: `import { notifyIssueResolved, notifyIssueInProgress } from '@/services/mailServiceIntegration';`
- [ ] Update `updateIssueStatus` function with mail service calls
- [ ] Reference `MAIL_SERVICE_QUICK_START.md` for exact code

### Step 9: Update AuthorityDashboard Component
- [ ] Open `src/pages/AuthorityDashboard.tsx`
- [ ] Add import for mail service functions
- [ ] Update the status change handler to send emails
- [ ] Add toast notifications for email sending status
- [ ] Test in UI

## Phase 4: Testing

### Step 10: Test Email Configuration
- [ ] Create a test email button in your component:
```tsx
const mailService = getMailService();
const success = await mailService.testConnection('test@example.com');
```
- [ ] Click the button
- [ ] Check if test email is received
- [ ] Verify no errors in browser console

### Step 11: Manual End-to-End Test
- [ ] Log in as authority user
- [ ] Open an issue in dashboard
- [ ] Create a test issue or select an existing one
- [ ] Change issue status to "in_progress"
- [ ] Check if email is sent to reporter
- [ ] Verify email content is correct
- [ ] Check `email_logs` table in Supabase
- [ ] Verify log entry exists with status "success"

### Step 12: Test Status Change to "Resolved"
- [ ] Change issue status to "resolved"
- [ ] Verify resolved notification email is sent
- [ ] Check email content includes resolution details
- [ ] Verify email_logs table shows the entry
- [ ] Test email templates render properly

## Phase 5: Monitoring & Admin Features

### Step 13: Create Admin Dashboard (Optional)
- [ ] Create `src/pages/AdminMailDashboard.tsx`
- [ ] Reference example in `MAIL_SERVICE_INTEGRATION_EXAMPLES.md`
- [ ] Add route to your router
- [ ] Test viewing email logs
- [ ] Test resending failed emails feature

### Step 14: Set Up Monitoring
- [ ] Check email_logs table regularly for failures
- [ ] Set up alerts/monitoring for failed emails
- [ ] Document process for handling failed emails

## Phase 6: Production Deployment

### Step 15: Environment Variables in Production
- [ ] Set environment variables in your deployment platform:
  - [ ] Vercel: Project Settings > Environment Variables
  - [ ] Netlify: Build & Deploy > Environment
  - [ ] Other: Set in deployment config
- [ ] Ensure `VITE_MAIL_ENABLED=true` in production
- [ ] Verify API keys are correct (use production keys, not test)

### Step 16: Test in Production
- [ ] Deploy to staging/production
- [ ] Test end-to-end email flow
- [ ] Monitor email_logs table
- [ ] Set up error monitoring/alerting

### Step 17: Security Checklist
- [ ] API keys are NOT committed to git
- [ ] `.env` file is in `.gitignore`
- [ ] Environment variables are set in production
- [ ] Test that emails contain no sensitive data
- [ ] Verify RLS policies on email_logs table

## Troubleshooting

### Common Issues & Fixes

#### Emails not sending?
- [ ] Check `VITE_MAIL_ENABLED=true` in `.env`
- [ ] Verify API key is correct and not expired
- [ ] Check browser console for error messages
- [ ] Test with `mailService.testConnection()`
- [ ] Check email_logs table for failed records

#### Mail service not initializing?
- [ ] Verify `initializeMailService()` is called in `main.tsx`
- [ ] Check browser console for initialization errors
- [ ] Verify environment variables are loaded

#### Can't find user email?
- [ ] Ensure Supabase auth is set up correctly
- [ ] Check that user profiles exist in `profiles` table
- [ ] Verify RLS policies allow reading user data

#### Backend not responding (Nodemailer)?
- [ ] Ensure backend service is running on port 3001
- [ ] Check `VITE_API_URL` is correct
- [ ] Test backend health: `curl http://localhost:3001/api/health`
- [ ] Check backend logs for errors

#### Provider-specific issues:
#### SendGrid:
- [ ] Verify email domain in "Sender Authentication"
- [ ] Check API key has "Mail Send" permission
- [ ] Ensure from email matches verified sender

#### Mailgun:
- [ ] Verify domain DNS records
- [ ] Check domain is verified in Mailgun dashboard
- [ ] Test with Mailgun sandbox domain first

## Success Criteria

Your implementation is complete when:
- ✅ Mail service initializes without errors
- ✅ Test email is successfully sent
- ✅ Email logs are created in Supabase
- ✅ Issue status changes trigger emails
- ✅ Email templates look professional
- ✅ Failed emails can be resent
- ✅ No errors in browser console
- ✅ No API keys exposed in code

## Next Steps (Optional Enhancements)

After basic implementation is working:
- [ ] Add email unsubscribe functionality
- [ ] Create email preference settings for users
- [ ] Add email templates customization
- [ ] Implement email scheduling
- [ ] Add attachments support (photos of resolved issues)
- [ ] Create email statistics dashboard
- [ ] Implement SPF/DKIM/DMARC for authentication
- [ ] Add comment notifications via email
- [ ] Multi-language email templates

## Documentation References

- Detailed Setup: `MAIL_SERVICE_README.md`
- Email Provider Setup: `MAIL_SERVICE_SETUP.md`
- Code Integration: `MAIL_SERVICE_INTEGRATION_EXAMPLES.md`
- Backend Setup: `BACKEND_EMAIL_SERVICE_EXAMPLE.md`
- Quick Start: `MAIL_SERVICE_QUICK_START.md`

## Support Resources

- [SendGrid Documentation](https://docs.sendgrid.com)
- [Mailgun Documentation](https://documentation.mailgun.com)
- [Nodemailer Documentation](https://nodemailer.com)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated**: February 2025
**Version**: 1.0
