/**
 * Mail Service Configuration Guide
 * 
 * This file explains how to configure and use the Civic Connect Mail Service
 */

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

/*
Add the following environment variables to your .env file:

# Enable mail service
VITE_MAIL_ENABLED=true

# Mail provider: supabase, sendgrid, mailgun, nodemailer
VITE_MAIL_PROVIDER=sendgrid

# Mail provider API key
VITE_MAIL_API_KEY=your_api_key_here

# Mail from address and name
VITE_MAIL_FROM_EMAIL=noreply@civicconnect.local
VITE_MAIL_FROM_NAME=Civic Connect

# API URL (for Nodemailer backend)
VITE_API_URL=http://localhost:3001

# Application URL (for email links)
VITE_APP_URL=http://localhost:5173

# For Mailgun provider
VITE_MAILGUN_DOMAIN=mail.example.com
*/

// ============================================================================
// SETUP BY EMAIL PROVIDER
// ============================================================================

/**
 * OPTION 1: SendGrid
 * 
 * 1. Sign up at https://sendgrid.com
 * 2. Create an API key in Settings > API Keys
 * 3. Set up a Sender Identity (verify your email or domain)
 * 4. Add to .env:
 *    VITE_MAIL_ENABLED=true
 *    VITE_MAIL_PROVIDER=sendgrid
 *    VITE_MAIL_API_KEY=your_sendgrid_api_key
 *    VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
 * 
 * Cost: Free tier available (100 emails/day)
 */

/**
 * OPTION 2: Mailgun
 * 
 * 1. Sign up at https://www.mailgun.com
 * 2. Create an account and add your domain
 * 3. Get your API key from the dashboard
 * 4. Add to .env:
 *    VITE_MAIL_ENABLED=true
 *    VITE_MAIL_PROVIDER=mailgun
 *    VITE_MAIL_API_KEY=your_mailgun_api_key
 *    VITE_MAILGUN_DOMAIN=mg.yourdomain.com
 *    VITE_MAIL_FROM_EMAIL=noreply@yourdomain.com
 * 
 * Cost: Free tier available (up to 100 emails/month)
 */

/**
 * OPTION 3: Nodemailer (Backend Service)
 * 
 * 1. Create a Node.js backend (Express recommended):
 *    - Install: npm install nodemailer express cors
 * 
 * 2. Create backend/src/routes/mail.ts:
 * 
 *    import express, { Router, Request, Response } from 'express';
 *    import nodemailer from 'nodemailer';
 *    
 *    const router = Router();
 *    
 *    const transporter = nodemailer.createTransport({
 *      service: 'gmail', // or any SMTP service
 *      auth: {
 *        user: process.env.MAIL_USER,
 *        pass: process.env.MAIL_PASSWORD,
 *      },
 *    });
 *    
 *    router.post('/mail/send', async (req: Request, res: Response) => {
 *      try {
 *        const { to, subject, html, text, fromName } = req.body;
 *        
 *        const mailOptions = {
 *          from: `${fromName} <${process.env.MAIL_FROM_EMAIL}>`,
 *          to,
 *          subject,
 *          html,
 *          text,
 *        };
 *        
 *        await transporter.sendMail(mailOptions);
 *        res.json({ success: true });
 *      } catch (error) {
 *        console.error('Error sending email:', error);
 *        res.status(500).json({ error: 'Failed to send email' });
 *      }
 *    });
 *    
 *    export default router;
 * 
 * 3. Add to .env:
 *    VITE_MAIL_ENABLED=true
 *    VITE_MAIL_PROVIDER=nodemailer
 *    VITE_API_URL=http://localhost:3001
 * 
 * Cost: Depends on your email service (Gmail, custom SMTP, etc.)
 */

/**
 * OPTION 4: Supabase Edge Functions
 * 
 * 1. Set up Supabase project with functions enabled
 * 2. Create an Edge Function:
 *    supabase functions new send-email
 * 
 * 3. In supabase/functions/send-email/index.ts:
 * 
 *    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 *    import { EmailClient, KnownEmailProvider } from "https://deno.land/x/azure_sdk/mod.ts"
 *    
 *    serve(async (req) => {
 *      const { to, subject, html, text, fromName } = await req.json()
 *      
 *      try {
 *        // Use your email provider (SendGrid, Mailgun, etc.)
 *        // Send email
 *        return new Response(JSON.stringify({ success: true }), {
 *          headers: { "Content-Type": "application/json" },
 *        })
 *      } catch (error) {
 *        return new Response(JSON.stringify({ error: error.message }), {
 *          status: 500,
 *          headers: { "Content-Type": "application/json" },
 *        })
 *      }
 *    })
 * 
 * Cost: Depends on Supabase pricing
 */

// ============================================================================
// INTEGRATION WITH ISSUE STATUS UPDATES
// ============================================================================

/**
 * Integration Steps:
 * 
 * 1. Import the mail service integration in your useIssues hook:
 *    import { notifyIssueResolved, notifyIssueInProgress } from '@/services/mailServiceIntegration';
 * 
 * 2. Call mail service when updating issue status:
 *    - When status changes to 'resolved': call notifyIssueResolved()
 *    - When status changes to 'in_progress': call notifyIssueInProgress()
 * 
 * 3. Initialize mail service on app startup:
 *    import { initializeMailService } from '@/services/mailServiceIntegration';
 *    
 *    // In App.tsx or main.tsx
 *    initializeMailService();
 */

// ============================================================================
// SUPABASE TABLE SETUP
// ============================================================================

/**
 * Create email_logs table in Supabase:
 * 
 * Run this SQL in Supabase SQL Editor:
 * 
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'error')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_issue_id ON email_logs(issue_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);

 * Optional: Enable Row Level Security (RLS)
 * ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
 */

// ============================================================================
// TESTING
// ============================================================================

/**
 * Test email sending:
 * 
 * 1. Add a test button to your component:
 * 
 *    import { getMailService } from '@/services/mailServiceIntegration';
 *    
 *    const handleTestEmail = async () => {
 *      const mailService = getMailService();
 *      const success = await mailService.testConnection('your@email.com');
 *      
 *      if (success) {
 *        toast.success('Test email sent successfully!');
 *      } else {
 *        toast.error('Failed to send test email');
 *      }
 *    };
 * 
 * 2. Check browser console for detailed logs
 * 3. Verify email receipt
 */

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Sending email when issue is resolved
 * 
 * In your updateIssueStatus function:
 * 
 *    const handleResolveIssue = async (issueId: string) => {
 *      const issue = issues.find(i => i.id === issueId);
 *      if (!issue) return;
 *      
 *      // Update status in Supabase
 *      await updateIssueStatus(issueId, 'resolved');
 *      
 *      // Send notification email
 *      const emailSent = await notifyIssueResolved(
 *        issue.user_id,
 *        issueId,
 *        {
 *          title: issue.title,
 *          description: issue.description,
 *          category: issue.category,
 *          address: issue.address || 'Unknown Location',
 *          resolutionDetails: 'The issue has been successfully resolved by our maintenance team.',
 *          resolvedMessage: 'Thank you for reporting this issue. Your feedback helps us improve!',
 *        }
 *      );
 *      
 *      if (emailSent) {
 *        toast.success('Email notification sent to reporter');
 *      }
 *    };
 */

export {};
