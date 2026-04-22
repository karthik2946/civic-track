import express, { Router, Request, Response } from 'express';
import { mailService } from '../services/mailService.js';
import { validateEmailPayload } from '../middleware/validation.js';

const router: Router = express.Router();

/**
 * POST /api/mail/send
 * Send an email
 */
router.post('/send', validateEmailPayload, async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text, fromName } = req.body;

    if (!mailService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Mail service is not initialized. Please check server configuration.',
      });
    }

    const result = await mailService.sendEmail({
      to,
      subject,
      html,
      text,
      fromName,
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email',
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/mail/send:', errorMessage);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * POST /api/mail/send-bulk
 * Send emails to multiple recipients
 */
router.post('/send-bulk', (req: Request, res: Response) => {
  try {
    const { recipients, subject, html, text, fromName } = req.body;

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Recipients must be a non-empty array',
      });
    }

    if (!subject || !html || !text) {
      return res.status(400).json({
        success: false,
        error: 'Subject, html, and text are required',
      });
    }

    if (!mailService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Mail service is not initialized',
      });
    }

    mailService
      .sendBulkEmail(recipients, {
        subject,
        html,
        text,
        fromName,
      })
      .then((result) => {
        res.status(200).json({
          success: result.success,
          message: `Sent ${result.successCount}/${recipients.length} emails`,
          successCount: result.successCount,
          failedCount: result.failedCount,
          errors: result.errors,
        });
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
          success: false,
          error: errorMessage,
        });
      });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/mail/send-bulk:', errorMessage);
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * GET /api/mail/status
 * Check mail service status
 */
router.get('/status', (req: Request, res: Response) => {
  const isReady = mailService.isReady();
  res.status(200).json({
    status: isReady ? 'ready' : 'not_initialized',
    ready: isReady,
    timestamp: new Date().toISOString(),
  });
});

export const mailRouter = router;
