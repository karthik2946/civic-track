# SMTP Mail Service - Quick Start Guide

Get the SMTP mailing service up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn
- SMTP provider credentials (Gmail, Outlook, SendGrid, etc.)

## Step 1: Configure Frontend (2 min)

Update `civic-connect-main/.env`:

```env
VITE_MAIL_ENABLED=true
VITE_MAIL_PROVIDER=nodemailer
VITE_API_URL=http://localhost:3001
```

## Step 2: Configure Backend (2 min)

Create `civic-connect-main/backend/.env` with your SMTP credentials:

### Option A: Gmail (Easiest)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```
> Need app password? Go to: https://myaccount.google.com/apppasswords

### Option B: Other Providers
See `../SMTP_MAIL_SERVICE_SETUP.md` for other providers

## Step 3: Install Dependencies (1 min)

```bash
# Backend dependencies
cd backend
npm install
```

## Step 4: Start the Servers (2 min)

**Terminal 1 - Frontend:**
```bash
cd civic-connect-main
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd civic-connect-main/backend
npm run dev
# Runs on http://localhost:3001
```

## Done! 🎉

### Test It:

1. Login as authority at http://localhost:5173
2. Find an issue to resolve
3. Mark it as "Resolved"
4. Check the backend console - you should see:
   ```
   ✅ Email sent to citizen@example.com
   ```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Mail service not initialized" | Check `.env` file in `backend/` directory |
| "SMTP connection rejected" | Verify SMTP credentials are correct |
| Port 3001 already in use | Change PORT in `backend/.env` |
| CORS errors | Verify `CORS_ORIGIN` matches frontend URL |
| Email not received | Check spam folder, test with different email |

## Full Documentation

See `SMTP_MAIL_SERVICE_SETUP.md` for complete setup guide and troubleshooting.

## API Endpoints

Quick reference:

```bash
# Check mail service status
curl http://localhost:3001/api/mail/status

# Send test email
curl -X POST http://localhost:3001/api/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "html": "<h1>Test</h1>",
    "text": "Test"
  }'

# Server health check
curl http://localhost:3001/health
```

## Project Structure

```
backend/
├── src/
│   ├── server.ts           # Main server
│   ├── services/          # SMTP service
│   ├── routes/            # API endpoints
│   └── middleware/        # Validation, errors
├── .env                   # Your credentials (create this!)
├── package.json
└── README.md             # Detailed documentation
```

---

**Need help?** See `backend/README.md` for complete documentation.
