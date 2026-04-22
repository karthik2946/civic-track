# Civic Connect Mail Service - Backend SMTP Server

This is the Node.js/Express backend server that handles SMTP email sending for the Civic Connect civic engagement platform.

## Overview

The mail service backend:
- Sends transactional emails (issue resolved notifications) using SMTP
- Integrates with any SMTP provider (Gmail, Outlook, SendGrid, Amazon SES, etc.)
- Provides REST API endpoints for email operations
- Includes validation, error handling, and logging

## Features

✅ **SMTP Support** - Any SMTP provider (Gmail, Outlook, SendGrid, etc.)
✅ **REST API** - Simple JSON endpoints for sending emails
✅ **Validation** - Request validation for email payloads
✅ **Error Handling** - Comprehensive error handling and logging
✅ **Health Checks** - Monitor server and mail service status
✅ **CORS** - Secure cross-origin requests
✅ **Bulk Emails** - Support for sending to multiple recipients

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory with your SMTP credentials:

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

### 3. Start the Server

**Development Mode (Hot Reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001`

## Environment Setup by Provider

### Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### Outlook / Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid SMTP

1. Create API key at: https://app.sendgrid.com/settings/api_keys
2. Configure:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

### Amazon SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### Custom SMTP Server

```env
SMTP_HOST=mail.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## API Endpoints

### 1. Send Single Email

**POST** `/api/mail/send`

Request:
```json
{
  "to": "citizen@example.com",
  "subject": "Your Issue Has Been Resolved",
  "html": "<h1>Hello</h1><p>Your issue...</p>",
  "text": "Hello\n\nYour issue...",
  "fromName": "Civic Connect"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@gmail.com>"
}
```

Response (Error):
```json
{
  "success": false,
  "error": "Invalid email address format"
}
```

### 2. Send Bulk Emails

**POST** `/api/mail/send-bulk`

Request:
```json
{
  "recipients": [
    "citizen1@example.com",
    "citizen2@example.com",
    "citizen3@example.com"
  ],
  "subject": "Notification about issues",
  "html": "<h1>Hello</h1>...",
  "text": "Hello...",
  "fromName": "Civic Connect"
}
```

Response:
```json
{
  "success": true,
  "message": "Sent 2/3 emails",
  "successCount": 2,
  "failedCount": 1,
  "errors": {
    "invalid-email@": "Invalid email address format"
  }
}
```

### 3. Check Mail Service Status

**GET** `/api/mail/status`

Response:
```json
{
  "status": "ready",
  "ready": true,
  "timestamp": "2024-02-11T10:30:45.123Z"
}
```

### 4. Health Check

**GET** `/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-11T10:30:45.123Z",
  "uptime": 123.45,
  "environment": "development"
}
```

## Frontend Integration

The frontend (React app) is already configured to use this backend:

1. **Configuration** in `frontend/.env`:
   ```env
   VITE_MAIL_PROVIDER=nodemailer
   VITE_API_URL=http://localhost:3001
   ```

2. **Automatic Email Sending** when authority resolves an issue:
   - Frontend calls `updateIssueStatus('resolved')`
   - `mailService.sendIssueResolvedNotification()` is triggered
   - Backend server receives request at `/api/mail/send`
   - Email is sent to citizen via SMTP

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Main application entry point
│   ├── middleware/
│   │   ├── errorHandler.ts    # Global error handling
│   │   └── validation.ts      # Request validation
│   ├── routes/
│   │   └── mail.ts            # Mail API routes
│   └── services/
│       └── mailService.ts     # SMTP mail service
├── dist/                      # Compiled JavaScript (after build)
├── .env                       # Environment variables (create this)
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

## Running Both Frontend and Backend

### Terminal 1 - Frontend:
```bash
cd civic-connect-main
npm run dev
# Frontend runs on http://localhost:5173
```

### Terminal 2 - Backend:
```bash
cd civic-connect-main/backend
npm run dev
# Backend runs on http://localhost:3001
```

## Debugging

### Check Mail Service Status
```bash
curl http://localhost:3001/api/mail/status
```

### Test Sending Email
```bash
curl -X POST http://localhost:3001/api/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'
```

### Check Server Health
```bash
curl http://localhost:3001/health
```

### View Logs
Check the console output where you ran `npm run dev`

## Troubleshooting

### "Mail service not initialized"
- Check that `.env` file exists in `backend/` directory
- Verify SMTP credentials are correct
- Look for initialization errors in console logs

### "SMTP connection failed"
- Verify SMTP_HOST and SMTP_PORT are correct
- Check SMTP_USER and SMTP_PASS
- Ensure Less Secure Apps is enabled (Gmail)
- Check firewall/network access to SMTP server

### "Invalid email address"
- Ensure email format is valid: `user@example.com`
- Check for typos or extra spaces

### "CORS errors"
- Frontend and backend must have matching CORS configuration
- Update `CORS_ORIGIN` in backend `.env` if frontend URL changes

## Production Deployment

### Environment Variables
1. Set production environment variables (use secure secret management)
2. Set `NODE_ENV=production`
3. Use production SMTP credentials (e.g., SendGrid, Amazon SES)

### Build and Deploy
```bash
npm run build
npm start
```

### Recommendations
- Use environment-specific secrets management
- Enable HTTPS (SSL/TLS) in production
- Monitor email delivery and bounces
- Implement retry logic for failed emails
- Use SendGrid, AWS SES, or similar for production scale

## Security Considerations

1. **Environment Variables** - Never commit `.env` to version control
2. **SMTP Credentials** - Use app-specific passwords, not main account credentials
3. **CORS** - Restrict to known frontend origins
4. **Validation** - All inputs are validated before processing
5. **Rate Limiting** - Consider adding rate limiting in production
6. **HTTPS** - Use HTTPS in production

## Support

For issues or questions:
1. Check the logs in the console
2. Verify environment variables are set correctly
3. Test SMTP connection with the configuration
4. Check the [Nodemailer documentation](https://nodemailer.com/)

## License

MIT
