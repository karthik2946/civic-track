# SMTP Mail Service Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CIVIC CONNECT PLATFORM                        │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────┐         ┌──────────────────────────┐
│   FRONTEND (Port 5173)        │         │   BACKEND (Port 3001)    │
├───────────────────────────────┤         ├──────────────────────────┤
│ React + TypeScript            │         │ Node.js + Express        │
│                               │         │                          │
│ Authority Dashboard           │    ┌────│ SMTP Mail Service        │
│  ├─ View Issues              │    │    │  ├─ Nodemailer           │
│  ├─ Resolve Issue      ─────────┐ │    │  ├─ Validation           │
│  └─ Send Notification  ───────┐ │ │    │  └─ Error Handling       │
│                               │ │ │    │                          │
│ Mail Service                  │ │ │    │ API Routes               │
│  ├─ mailService.ts    ────────┼─┼─┼───│─ POST /api/mail/send     │
│  ├─ emailTemplates.ts         │ │ │    │─ GET /api/mail/status    │
│  └─ mailServiceInit.ts        │ │ │    │─ GET /health             │
│                               │ │ │    │                          │
└───────────────────────────────┘ │ │    └──────────────────────────┘
                                  │ │            │
                                  │ │            ▼
                          JSON    │ │   ┌──────────────────────┐
                       (HTTP POST)│ │   │  SMTP Configuration  │
                                  │ │   ├──────────────────────┤
                                  │ │   │ SMTP_HOST: ...       │
                                  │ │   │ SMTP_PORT: 587       │
                                  │ │   │ SMTP_USER: ...       │
                                  │ │   │ SMTP_PASS: ...       │
                                  │ │   └──────────────────────┘
                                  │ │            │
                                  │ └────────────┘
                                  │
                                  ▼
                          ┌──────────────────────┐
                          │  SMTP PROVIDER       │
                          ├──────────────────────┤
                          │• Gmail               │
                          │• Outlook             │
                          │• SendGrid            │
                          │• AWS SES             │
                          │• Custom SMTP         │
                          └──────────────────────┘
                                  │
                                  ▼
                          ┌──────────────────────┐
                          │ CITIZEN EMAIL INBOX  │
                          ├──────────────────────┤
                          │ ✅ Issue Resolved    │
                          │ 🔧 In Progress       │
                          │ 📧 Other Events      │
                          └──────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│                  (Supabase - PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────┤
│ • Issues Table    (id, title, status, user_id, ...)             │
│ • Profiles Table  (user_id, full_name, email, ...)              │
│ • Email Logs      (id, recipient, subject, sent_at, status)     │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: Authority Resolves Issue in Dashboard                       │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► AuthorityDashboard.tsx
             └─► handleResolveIssue()
                 └─► updateIssueStatus('resolved')

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend Initiates Email Sending                            │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► useIssues Hook (useIssues.tsx)
             └─► updates issue status in Supabase
             └─► sendIssueResolvedNotification()

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend Prepares Email                                     │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► mailService.ts
             └─► Email Content Generated
                 ├─ emailTemplates.ts
                 │  └─ Subject: "✅ Your Report Has Been Resolved"
                 │  └─ HTML email with details
                 └─ Get citizen email from Supabase

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 4: Frontend Sends to Backend                                   │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► Fetch Request
             ├─ Method: POST
             ├─ URL: http://localhost:3001/api/mail/send
             ├─ Headers: {"Content-Type": "application/json"}
             └─ Body: {
                  to: "citizen@example.com",
                  subject: "✅ Your Report Has Been Resolved",
                  html: "<h1>Your issue...</h1>",
                  text: "Your issue..."
                }

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 5: Backend Receives Request                                    │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► Express Router (routes/mail.ts)
             └─► POST /api/mail/send
                 └─► validateEmailPayload (middleware)

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 6: Backend Sends Email via SMTP                                │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► mailService.sendEmail()
             └─► Nodemailer SMTP Transport
                 ├─ Connect to: smtp.gmail.com:587
                 ├─ Authenticate with credentials
                 └─ Send email
                    ├─ From: noreply@civicconnect.local
                    ├─ To: citizen@example.com
                    ├─ Subject: ✅ Your Report Has Been Resolved
                    └─ Body: HTML + Plain Text

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 7: SMTP Provider Sends Email                                   │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► Gmail / Outlook / SendGrid / etc.
             └─► Process and route email
                 └─► Deliver to recipient mailbox

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 8: Backend Returns Response to Frontend                        │
└──────────────────────────────────────────────────────────────────────┘
         │
         └─► Response: 200 OK
             {
               "success": true,
               "message": "Email sent successfully",
               "messageId": "<message-id@gmail.com>"
             }

┌──────────────────────────────────────────────────────────────────────┐
│ STEP 9: Frontend Shows Success Toast & Citizen Receives Email        │
└──────────────────────────────────────────────────────────────────────┘
         │
         ├─► Frontend: toast.success("Email sent!")
         │
         └─► Citizen Email Inbox: 
             📧 New Message: "✅ Your Report Has Been Resolved"
```

## Data Flow

```
ISSUE STATUS UPDATE
│
├─ Supabase: UPDATE issues SET status='resolved'
│
├─ Get citizen email
│  └─ Supabase: SELECT email FROM profiles WHERE user_id = ?
│
├─ Get issue details
│  └─ title, description, category, location, etc.
│
├─ Generate email content
│  ├─ HTML version (from emailTemplates.ts)
│  └─ Plain text version
│
├─ SMTP Request to Backend
│  {
│    to: citizen@example.com,
│    subject: ...,
│    html: ...,
│    text: ...
│  }
│
├─ Backend SMTP Processing
│  ├─ Validate email format
│  ├─ Connect to SMTP server
│  ├─ Authenticate
│  └─ Send email
│
└─ Email Delivered to Inbox
```

## Configuration Flow

```
┌──────────────────────────────────────┐
│      Backend Startup                 │
│       (server.ts)                    │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   Load .env variables                │
│   ├─ SMTP_HOST                       │
│   ├─ SMTP_PORT                       │
│   ├─ SMTP_USER                       │
│   └─ SMTP_PASS                       │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   Initialize SMTP Transporter        │
│   (mailService.initialize)           │
└──────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────┐
│   Verify SMTP Connection             │
│   transporter.verify()               │
└──────────────────────────────────────┘
            │
        ┌───┴───┐
        │       │
      SUCCESS   FAILURE
        │       │
        ▼       ▼
      ✅     ⚠️ Warning
    Ready    Not Init.
```

## File Organization

```
backend/
│
├── src/
│   │
│   ├── server.ts
│   │   └─ Express app setup
│   │   └─ SMTP initialization
│   │   └─ Middleware configuration
│   │   └─ Route mounting
│   │   └─ Error handler
│   │
│   ├── services/
│   │   └── mailService.ts
│   │       └─ SMTP transporter creation
│   │       └─ sendEmail() function
│   │       └─ sendBulkEmail() function
│   │       └─ initialize() function
│   │
│   ├── routes/
│   │   └── mail.ts
│   │       └─ POST /api/mail/send
│   │       └─ POST /api/mail/send-bulk
│   │       └─ GET /api/mail/status
│   │
│   └── middleware/
│       ├── validation.ts
│       │   └─ validateEmailPayload()
│       │   └─ isValidEmail()
│       │
│       └── errorHandler.ts
│           └─ Global error handling
│           └─ Error logging
│           └─ Response formatting
│
├── dist/
│   └─ Compiled JavaScript (after build)
│
├── .env
│   └─ SMTP credentials
│   └─ Server config
│
├── package.json
│   └─ Dependencies
│   └─ Scripts
│
└── tsconfig.json
    └─ TypeScript config
```

## Technology Stack

```
FRONTEND
├─ React 18+
├─ TypeScript
├─ Vite
├─ Shadcn/ui Components
├─ Supabase Client
└─ Axios/Fetch for HTTP

BACKEND
├─ Node.js 16+
├─ TypeScript
├─ Express 4.18+
├─ Nodemailer 6.9+
├─ CORS middleware
└─ Dotenv

EMAIL PROVIDERS
├─ Gmail SMTP
├─ Outlook/Hotmail SMTP
├─ SendGrid SMTP
├─ Amazon SES SMTP
└─ Custom SMTP servers

DATABASE
├─ Supabase (PostgreSQL)
├─ Issues table
├─ Profiles table
├─ Email logs (optional)
└─ Row-Level Security

DEPLOYMENT
├─ Frontend: Vercel/Netlify/AWS
├─ Backend: Heroku/AWS/DigitalOcean
└─ Database: Supabase Cloud
```

---

For full implementation guide, see: `SMTP_MAIL_SERVICE_SETUP.md`
