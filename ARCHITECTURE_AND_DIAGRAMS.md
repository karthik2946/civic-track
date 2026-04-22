# Mail Service Implementation Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CIVIC CONNECT APPLICATION                          │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    AUTHORITY DASHBOARD                          │  │
│  │  - View Issues                                                  │  │
│  │  - Change Status (reported → in_progress → resolved)           │  │
│  │  - Add Resolution Details                                       │  │
│  └──────────────┬───────────────────────────────────────────────┬──┘  │
│                 │                                               │      │
│  ┌──────────────▼──────────────────────────────────────────────▼──┐   │
│  │           useIssues Hook (updateIssueStatus)                   │   │
│  │  1. Update Supabase issue status                              │   │
│  │  2. Call notifyIssueResolved() or notifyIssueInProgress()    │   │
│  └──────────────┬───────────────────────────────────────────────┬──┘   │
│                 │                                               │      │
│  ┌──────────────▼──────────────────────────────────────────────▼──┐   │
│  │        Mail Service Integration (mailServiceIntegration.ts)    │   │
│  │  - Get user email from Supabase Auth                          │   │
│  │  - Get user name from Supabase profiles                       │   │
│  │  - Create email template                                      │   │
│  │  - Call MailService.sendEmail()                              │   │
│  │  - Log email to email_logs table                             │   │
│  └──────────────┬───────────────────────────────────────────────┬──┘   │
│                 │                                               │      │
│  ┌──────────────▼──────────────────────────────────────────────▼──┐   │
│  │          Mail Service (mailService.ts)                         │   │
│  │  - Route to correct email provider                            │   │
│  │  - Handle provider-specific API calls                         │   │
│  │  - Error handling & retry logic                              │   │
│  └──────────────┬──────────────────────────────────────────────┬───┘   │
│                 │                                              │       │
└─────────────────┼──────────────────────────────────────────────┼───────┘
                  │                                              │
        ┌─────────▼────────┬──────────────────┬─────────┬────────▼────┐
        │                  │                  │         │             │
    ┌───▼──────┐    ┌──────▼────┐     ┌──────▼────┐  ┌─▼──────┐  ┌──▼────────┐
    │ SendGrid │    │  Mailgun   │     │ Nodemailer    │ Supabase │ │ Custom    │
    │   API    │    │    API     │     │ Backend       │ Edge Fn  │ │ Provider  │
    └──────────┘    └────────────┘     └───────────┘  └──────────┘  └──────────┘
        │                  │                  │             │             │
        └──────────────────┴──────────────────┴─────────────┴─────────────┘
                                   │
                                   │ (Sends Email)
                                   │
        ┌──────────────────────────▼─────────────────────────────┐
        │                                                        │
        │    User Email Inbox                                   │
        │  ┌─────────────────────────────────────────────┐      │
        │  │ From: Civic Connect                         │      │
        │  │ Subject: ✅ Your Report Has Been Resolved   │      │
        │  │                                             │      │
        │  │ Your reported pothole on Main St has been   │      │
        │  │ successfully fixed...                       │      │
        │  └─────────────────────────────────────────────┘      │
        │                                                        │
        └────────────────────────────────────────────────────────┘

        Also Creates Log Entry in Supabase:
        ┌──────────────────────────────────────┐
        │ email_logs Table                     │
        ├──────────────────────────────────────┤
        │ user_id: xxx                         │
        │ issue_id: yyy                        │
        │ email_type: issue_resolved           │
        │ status: success                      │
        │ sent_at: 2024-02-25T10:30:00        │
        └──────────────────────────────────────┘
```

## Data Flow Diagram

```
1. AUTHORITY ACTION
   Authority Dashboard → "Mark as Resolved" button
                            │
                            ▼
2. UPDATE ISSUE
   updateIssueStatus(issueId, "resolved")
                            │
                            ▼
3. DATABASE UPDATE
   Supabase: issues table → status = "resolved"
                            │
                            ▼
4. FETCH USER INFO
   - Get user email from auth
   - Get user name from profiles
                            │
                            ▼
5. PREPARE EMAIL
   - Load email template
   - Fill in user data (name, issue details)
   - Generate HTML and text versions
                            │
                            ▼
6. SEND EMAIL
   Select provider:
   ├─ SendGrid: POST to /v3/mail/send
   ├─ Mailgun: POST to /v3/messages
   ├─ Nodemailer: POST to http://localhost:3001/api/mail/send
   └─ Supabase: POST to /functions/v1/send-email
                            │
                            ▼
7. EMAIL SENT
   Email Provider sends email to user
                            │
                            ▼
8. LOG RESULT
   Create entry in email_logs table:
   - Status: success/failed
   - Error message (if any)
   - Timestamp
                            │
                            ▼
9. USER NOTIFICATION
   - Email delivered to user inbox
   - User reads resolution update
   - Optional: admin sees log entry
```

## File Organization

```
src/
├── services/
│   ├── mailService.ts                 ← Core mail service (380+ lines)
│   ├── emailTemplates.ts              ← Email templates (250+ lines)
│   └── mailServiceIntegration.ts      ← Integration utilities (180+ lines)
│
├── hooks/
│   └── useIssues.tsx                  ← (Update with mail calls)
│
└── pages/
    ├── AuthorityDashboard.tsx         ← (Update with mail integration)
    └── AdminMailDashboard.tsx         ← (Optional: admin panel)

supabase/
├── migrations/
│   └── email_logs_setup.sql           ← Database setup
│
└── functions/
    └── send-email-function.ts         ← Supabase option

Documentation:
├── MAIL_SERVICE_README.md             ← Start here
├── MAIL_SERVICE_SETUP.md              ← Provider setup
├── MAIL_SERVICE_INTEGRATION_EXAMPLES.md ← Code examples
├── MAIL_SERVICE_QUICK_START.md        ← Copy-paste code
├── BACKEND_EMAIL_SERVICE_EXAMPLE.md   ← Backend setup
├── IMPLEMENTATION_CHECKLIST.md        ← Step-by-step guide
└── MAIL_SERVICE_IMPLEMENTATION_SUMMARY.md ← This summary
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│                                                             │
│  Authority Dashboard                                       │
│  ├─ View Issues List                                       │
│  ├─ Click Issue                                            │
│  ├─ Modal Opens                                            │
│  └─ [Mark as Resolved] button                               │
│         │                                                  │
│         └─► triggers handleStatusChange()                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC                            │
│                                                             │
│  useIssues Hook                                            │
│  └─ updateIssueStatus(issueId, "resolved")                 │
│     ├─ Update Supabase                                     │
│     └─ Call notifyIssueResolved()                           │
│        └─ Get user email                                   │
│        └─ Build email template                             │
│        └─ Call mailService.send()                          │
│        └─ Log result to email_logs                         │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                             │
│                                                             │
│  Email Provider                                            │
│  ├─ SendGrid ──────── HTTP API                            │
│  ├─ Mailgun ────────── HTTP API                           │
│  ├─ Nodemailer ──────── Backend Service                   │
│  └─ Supabase Functions ─── Serverless                     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   END RESULT                                │
│                                                             │
│  User Receives Email                                       │
│  ├─ Professional HTML design                               │
│  ├─ Issue details                                          │
│  ├─ Resolution information                                 │
│  └─ Call to action                                         │
│                                                             │
│  Admin Can Track                                           │
│  ├─ Email sent (email_logs)                               │
│  ├─ Status (success/failed)                               │
│  ├─ Resend if failed                                       │
│  └─ Analytics & reports                                    │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Flow

```
Environment Setup
   │
   ├─ .env file
   │  ├─ VITE_MAIL_ENABLED=true
   │  ├─ VITE_MAIL_PROVIDER=sendgrid
   │  ├─ VITE_MAIL_API_KEY=...
   │  └─ VITE_MAIL_FROM_EMAIL=...
   │
   └─► initializeMailService()
       │
       └─► MailService.initialize()
           │
           └─ Reads env variables
              Validates configuration
              Returns initialized service
```

## Error Handling Flow

```
Email Send Attempt
   │
   ├─ SUCCESS
   │  └─► Log: status = "success"
   │  └─► Notify user (optional)
   │
   ├─ TRANSIENT ERROR (Network issue)
   │  └─► Log: status = "failed"
   │  └─► Retry logic (exponential backoff)
   │  └─► Admin can resend via admin dashboard
   │
   └─ PERMANENT ERROR (Invalid email)
      └─► Log: status = "error"
      └─► Log error message
      └─► Create admin alert
      └─► Manual intervention needed
```

## Provider Selection Guide

```
Choose Email Provider Based On:

┌─────────────────┬─────────────┬──────────────┬─────────────┐
│    Provider     │  Setup Time │  Ease Level  │    Cost     │
├─────────────────┼─────────────┼──────────────┼─────────────┤
│ SendGrid        │  15 min     │  ★★★★★      │ Free tier   │
│ (RECOMMENDED)   │             │  (Easiest)   │ available   │
├─────────────────┼─────────────┼──────────────┼─────────────┤
│ Mailgun         │  20 min     │  ★★★★☆      │ Free tier   │
│                 │             │  (Easy)      │ available   │
├─────────────────┼─────────────┼──────────────┼─────────────┤
│ Nodemailer      │  60 min     │  ★★★☆☆      │ Your server │
│ (Self-hosted)   │             │  (Medium)    │ costs       │
├─────────────────┼─────────────┼──────────────┼─────────────┤
│ Supabase        │  40 min     │  ★★★☆☆      │ Supabase    │
│ Edge Functions  │             │  (Medium)    │ plan        │
└─────────────────┴─────────────┴──────────────┴─────────────┘

RECOMMENDATION: Start with SendGrid (15 minutes to production!)
```

## Status Change Workflow

```
Issue Status Progression:

┌──────────┐      ┌────────────┐       ┌──────────┐
│ Reported │  ──► │ In Progress│  ──► │ Resolved │
└──────────┘      └────────────┘       └──────────┘
     ▲                  ▲                    ▲
     │                  │                    │
     │ Email 1:         │ Email 2:           │ Email 3:
     │ (Optional)       │ User notified      │ Issue resolved
     │ Confirmation     │ issue being worked │ notification
     │ received         │ on                 │ sent
     │                  │                    │
     └────────────────────────────────────────┘
        All logged in email_logs table
```

## Testing Workflow

```
Before Deployment:

1. Unit Test
   └─ mailService.testConnection(email)
   
2. Integration Test
   └─ notifyIssueResolved(userId, issueId, data)
   
3. End-to-End Test
   ├─ Mark issue as resolved in UI
   ├─ Check email received
   ├─ Verify email_logs entry created
   └─ Check email content
   
4. Admin Dashboard Test
   ├─ View email logs
   ├─ Check success rate
   └─ Resend failed emails
   
5. Production Test
   └─ Repeat 1-4 in production environment
```

---

This architecture ensures:
✅ Clean separation of concerns
✅ Provider flexibility
✅ Comprehensive logging
✅ Easy testing and debugging
✅ Scalability
✅ Error recovery
✅ Professional quality
