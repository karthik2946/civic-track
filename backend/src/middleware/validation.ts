import { Request, Response, NextFunction } from 'express';

/**
 * Validate email payload
 */
export const validateEmailPayload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { to, subject, html, text } = req.body;

  const errors: string[] = [];

  // Check required fields
  if (!to) {
    errors.push('to: Recipient email address is required');
  } else if (!isValidEmail(to)) {
    errors.push('to: Invalid email address format');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    errors.push('subject: Email subject is required and must be a non-empty string');
  }

  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    errors.push('html: HTML content is required and must be a non-empty string');
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    errors.push('text: Plain text content is required and must be a non-empty string');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors,
    });
    return;
  }

  next();
};

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
