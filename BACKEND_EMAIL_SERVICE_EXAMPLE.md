/**
 * Backend Email Service Example using Node.js/Express and Nodemailer
 * 
 * This is a complete example backend that can be used alongside Civic Connect
 * to send emails using Nodemailer.
 * 
 * Installation:
 * npm install express nodemailer cors dotenv
 * npm install -D @types/express @types/nodemailer typescript ts-node
 * 
 * .env file:
 * PORT=3001
 * MAIL_SERVICE=gmail  # or your email service
 * MAIL_USER=your-email@gmail.com
 * MAIL_PASSWORD=your-app-password
 * MAIL_FROM=Civic Connect <noreply@civicconnect.local>
 * FRONTEND_URL=http://localhost:5173
 */

/*
// backend/src/index.ts
import express, { Express, Request, Response } from 'express';
import nodemailer, { Transporter } from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Nodemailer transporter
const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

// Route to send email
app.post('/api/mail/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text, fromName } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, html',
      });
    }

    // Validate email format
    const emailRegex = /^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        error: 'Invalid email address',
      });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `${fromName || 'Civic Connect'} <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
      text,
      // Optional: Add reply-to address
      replyTo: process.env.MAIL_REPLY_TO || undefined,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);

    res.status(500).json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Route to test email configuration
app.post('/api/mail/test', async (req: Request, res: Response) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        error: 'Missing testEmail field',
      });
    }

    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `Civic Connect <${process.env.MAIL_USER}>`,
      to: testEmail,
      subject: 'Civic Connect - Email Configuration Test',
      html: `
        <h1>Email Configuration Test</h1>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>You can now use the Civic Connect mail service.</p>
      `,
      text: 'Email Configuration Test\n\nIf you received this email, your email configuration is working correctly!',
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Error testing email:', error);

    res.status(500).json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Route to send batch emails
app.post('/api/mail/batch', async (req: Request, res: Response) => {
  try {
    const { recipients, subject, html, text } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: 'Recipients must be a non-empty array',
      });
    }

    if (!subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: subject, html',
      });
    }

    const transporter = createTransporter();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>,
    };

    // Send emails sequentially
    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: `Civic Connect <${process.env.MAIL_USER}>`,
          to: email,
          subject,
          html,
          text,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.json({
      success: true,
      message: `Batch email sent. Success: ${results.success}, Failed: ${results.failed}`,
      results,
    });
  } catch (error) {
    console.error('Error sending batch emails:', error);

    res.status(500).json({
      error: 'Failed to send batch emails',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\\n🚀 Mail service running on http://localhost:${PORT}`);
  console.log(`📧 Send emails to: POST http://localhost:${PORT}/api/mail/send`);
  console.log(`\\n`);
});

export default app;
*/

// ============================================================================
// Alternative: Using Gmail with App Password
// ============================================================================

/*
Google Gmail Setup:
1. Enable 2-Factor Authentication on your Google Account
2. Create an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
3. Use this password in MAIL_PASSWORD environment variable

.env example:
MAIL_SERVICE=gmail
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_FROM=Civic Connect <noreply@civicconnect.local>
*/

// ============================================================================
// Alternative: Using SendGrid SMTP
// ============================================================================

/*
SendGrid SMTP Setup:
1. Create account at sendgrid.com
2. Generate an API key
3. Use these settings:

.env:
MAIL_SERVICE=sendgrid
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxx
MAIL_FROM=Civic Connect <noreply@yourdomain.com>

Update transport configuration:
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
*/

// ============================================================================
// Alternative: Using Mailgun SMTP
// ============================================================================

/*
Mailgun SMTP Setup:
1. Create account at mailgun.com
2. Verify your domain
3. Get SMTP credentials from dashboard

.env:
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=postmaster@yourdomain.mailgun.org
MAIL_PASSWORD=your_mailgun_password
MAIL_FROM=Civic Connect <noreply@yourdomain.mailgun.org>
*/

// ============================================================================
// Docker Compose for Backend (Optional)
// ============================================================================

/*
// docker-compose.yml
version: '3.8'
services:
  mail-service:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - MAIL_SERVICE=${MAIL_SERVICE}
      - MAIL_USER=${MAIL_USER}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - MAIL_FROM=${MAIL_FROM}
    restart: unless-stopped
*/

export {};
