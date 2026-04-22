# Civic Connect SMTP Mailing Service Setup Guide

This guide explains how to set up and use the SMTP mailing service for the Civic Connect platform. The service sends email notifications to citizens when their issues are marked as resolved by authorities.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [SMTP Provider Configuration](#smtp-provider-configuration)
5. [Testing the Service](#testing-the-service)
6. [Email Templates](#email-templates)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

## Overview

The SMTP mailing service is a two-part system:

1. **Frontend** (React + TypeScript): Handles user interactions and initiates email sending
2. **Backend** (Node.js + Express): Handles SMTP connections and sends emails

### Email Flow

```
✅ Issue Marked as Resolved
    ↓
📧 Frontend triggers sendIssueResolvedNotification()
    ↓
🌐 Frontend calls backend API: POST /api/mail/send
    ↓
📤 Backend connects to SMTP server
    ↓
✉️  Email sent to citizen's inbox
```

## Architecture

### Technology Stack

- **Frontend**: React, TypeScript, Shadcn/ui components
- **Backend**: Node.js, Express, Nodemailer
- **SMTP**: Any SMTP provider (Gmail, Outlook, SendGrid, AWS SES, etc.)
- **Database**: Supabase (PostgreSQL)

### Project Structure

```
civic-connect-main/
├── frontend files...
├── src/
│   ├── services/
│   │   ├── mailService.ts          # Frontend mail service
│   │   ├── emailTemplates.ts       # Email HTML/text templates
│   │   └── mailServiceInit.ts      # Mail service initialization
│   ├── pages/
│   │   └── AuthorityDashboard.tsx  # Triggers email sending
│   └── hooks/
│       └── useIssues.tsx           # Issue status updates
├── backend/                        # 👈 Backend server
│   ├── src/
│   │   ├── server.ts              # Main server file
│   │   ├── services/mailService.ts # SMTP connection & sending
│   │   ├── routes/mail.ts         # API endpoints
│   │   └── middleware/            # Validation & error handling
│   ├── .env                       # SMTP credentials (create this)
│   └── package.json
├── .env                           # Frontend config (update this)
└── .env.example                   # Example config
```

## Setup Instructions

### Step 1: Install Frontend Dependencies

```bash
# In the project root directory
npm install
```

### Step 2: Install Backend Dependencies

```bash
# In the backend directory
cd backend
npm install
```

### Step 3: Configure SMTP Credentials

Choose your SMTP provider and follow the configuration below.

### Step 4: Set Environment Variables

#### Frontend Configuration

Update `civic-connect-main/.env`:

```env
# Mail Service Configuration - SMTP via Nodemailer
VITE_MAIL_ENABLED=true
VITE_MAIL_PROVIDER=nodemailer
VITE_MAIL_FROM_EMAIL=noreply@civicconnect.local
VITE_MAIL_FROM_NAME=Civic Connect
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
```

#### Backend Configuration

Create `civic-connect-main/backend/.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Mail Configuration
MAIL_FROM_EMAIL=noreply@civicconnect.local
MAIL_FROM_NAME=Civic Connect

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## SMTP Provider Configuration

### Gmail (Recommended for Testing)

**Setup Steps:**
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password

**.env Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### Outlook / Hotmail

**.env Configuration:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid

**Setup Steps:**
1. Create account at https://sendgrid.com
2. Create API key at https://app.sendgrid.com/settings/api_keys
3. Copy the API key

**.env Configuration:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key
```

### Amazon SES

**Setup Steps:**
1. Verify email address in AWS SES
2. Create SMTP credentials in SES console
3. Copy username and password

**.env Configuration:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### Other SMTP Providers

For other providers, get the SMTP details and update:
```env
SMTP_HOST=mail.provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Testing the Service

### Start Both Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# http://localhost:3001
```

### Test Workflow

1. **Log in as Authority** at http://localhost:5173
   - Use authority credentials (or create test authority account)

2. **Find an Issue** on the Authority Dashboard
   - You should see reported issues from citizens

3. **Resolve an Issue**
   - Click on an issue
   - Set status to "Resolved"
   - Add resolution details and message
   - Click "Resolve Issue"

4. **Check Backend Logs**
   - Look for console output showing email sending
   - Example: `✅ Email sent to citizen@example.com`

5. **Verify Email**
   - Check the citizen's email inbox
   - You should see the resolved notification email

### Manual API Test

Test the backend API directly:

```bash
# Test mail service status
curl http://localhost:3001/api/mail/status

# Test sending email manually
curl -X POST http://localhost:3001/api/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test email</p>",
    "text": "Test email"
  }'

# Test server health
curl http://localhost:3001/health
```

## Email Templates

### Issue Resolved Email

Subject: `✅ Your Report Has Been Resolved - [Issue Title]`

**What's included:**
- Greeting with citizen's name
- Issue details (title, description, category, location)
- Resolution details (if provided)
- Message from authority (if provided)
- Dashboard link
- Footer with Civic Connect branding

### Issue In Progress Email

Subject: `🔧 Your Issue is Being Worked On - [Issue Title]`

**What's included:**
- Greeting with citizen's name
- Acknowledgment that work has begun
- Issue details
- Encouragement to wait for updates

**Location:** `src/services/emailTemplates.ts`

You can customize the email templates by editing this file. All HTML and text versions are included.

## API Reference

### Send Single Email

**Endpoint:** `POST /api/mail/send`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "to": "citizen@example.com",
  "subject": "Your Issue Has Been Resolved",
  "html": "<h1>Hello</h1><p>Your issue has been resolved...</p>",
  "text": "Hello\n\nYour issue has been resolved...",
  "fromName": "Civic Connect"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@provider.com>"
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "error": "Error description",
  "details": ["Validation error details"]
}
```

### Check Mail Service Status

**Endpoint:** `GET /api/mail/status`

**Response:**
```json
{
  "status": "ready",
  "ready": true,
  "timestamp": "2024-02-11T10:30:45.123Z"
}
```

### Server Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-11T10:30:45.123Z",
  "uptime": 123.45,
  "environment": "development"
}
```

## Troubleshooting

### Issue: "Mail service not initialized"

**Cause:** SMTP credentials are not configured

**Solution:**
1. Check that `.env` file exists in `backend/` directory
2. Verify all required SMTP variables are set:
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASS
3. Restart backend server with `npm run dev`

### Issue: "SMTP connection rejected"

**Cause:** SMTP credentials are incorrect or server is unreachable

**Solutions:**
1. Verify credentials are correct in SMTP provider dashboard
2. For Gmail: Ensure App Password (not regular password) is used
3. For Gmail: Check that 2-Factor Authentication is enabled
4. Check that firewall/network allows SMTP port (usually 587 or 465)
5. For SendGrid: Ensure username is exactly "apikey"

### Issue: "Invalid email address"

**Cause:** Email format is invalid

**Solution:**
- Ensure email follows format: `user@example.com`
- Check citizen profile has valid email
- No extra spaces or special characters

### Issue: "CORS error when sending email"

**Cause:** Frontend and backend URLs don't match CORS configuration

**Solution:**
1. Check `CORS_ORIGIN` in `backend/.env`
2. Should match frontend URL: `http://localhost:5173`
3. For production: Update to actual frontend domain

### Issue: "Email received but formatting is wrong"

**Cause:** Email template needs adjustment

**Solution:**
- Edit email templates in `src/services/emailTemplates.ts`
- Update HTML/CSS styling
- Restart frontend server

### Issue: Backend won't start

**Cause:** Port already in use or dependencies not installed

**Solutions:**
1. Check if port 3001 is available: `netstat -ano | findstr :3001` (Windows)
2. Install dependencies: `npm install` in backend directory
3. Clear node_modules: `rm -rf node_modules && npm install`

### Issue: No emails being sent but no errors

**Cause:** Mail service might be disabled

**Solution:**
1. Check `VITE_MAIL_ENABLED=true` in frontend `.env`
2. Check backend logs: `npm run dev` output
3. Test with curl: `curl http://localhost:3001/api/mail/status`

## Environment Checklist

Before going to production:

- [ ] SMTP credentials tested and working
- [ ] Frontend `.env` configured correctly
- [ ] Backend `.env` configured correctly
- [ ] Both servers starting without errors
- [ ] Test email sent successfully
- [ ] Email contents display correctly
- [ ] CORS_ORIGIN set to production frontend URL
- [ ] NODE_ENV=production in backend `.env`
- [ ] Production SMTP provider configured (SendGrid, SES, etc.)
- [ ] Email logging/monitoring set up
- [ ] Error handling and retry logic tested

## Next Steps

1. **Email Customization**
   - Modify templates in `src/services/emailTemplates.ts`
   - Add custom branding and messaging

2. **Production Deployment**
   - Use production SMTP provider (SendGrid, Amazon SES)
   - Deploy frontend to hosting (Vercel, Netlify)
   - Deploy backend to server (Heroku, AWS, DigitalOcean)
   - Set production environment variables

3. **Monitoring & Analytics**
   - Track email delivery rates
   - Monitor bounce rates
   - Log email sending events
   - Set up email alerts for failures

4. **Additional Features**
   - Add email templates for other notifications
   - Implement email queuing for heavy traffic
   - Add unsubscribe functionality
   - Implement email preference center

## Support

For issues or questions:
1. Check backend logs: `npm run dev` output
2. Test API endpoints with curl
3. Verify SMTP credentials in email provider dashboard
4. Check [Nodemailer documentation](https://nodemailer.com/)

---

**Last Updated:** February 2024
