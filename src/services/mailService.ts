/**
 * Mail Service - Handles sending emails to users
 * Supports multiple email providers: Supabase, SendGrid, Nodemailer, etc.
 */

import { supabase } from '@/integrations/supabase/client';
import { emailTemplates, EmailTemplateData } from './emailTemplates';

export enum EmailProvider {
  SUPABASE = 'supabase',
  SENDGRID = 'sendgrid',
  NODEMAILER = 'nodemailer',
  MAILGUN = 'mailgun',
}

export interface EmailConfig {
  provider: EmailProvider;
  apiKey?: string;
  apiSecret?: string;
  fromEmail?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
}

export interface MailServiceConfig {
  enabled: boolean;
  provider: EmailProvider;
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
}

class MailService {
  private config: MailServiceConfig;
  private static instance: MailService;

  private constructor(config: MailServiceConfig) {
    this.config = config;
  }

  static getInstance(config?: MailServiceConfig): MailService {
    if (!MailService.instance && config) {
      MailService.instance = new MailService(config);
    } else if (!MailService.instance) {
      // Default configuration
      MailService.instance = new MailService({
        enabled: false,
        provider: EmailProvider.SUPABASE,
        fromEmail: import.meta.env.VITE_MAIL_FROM_EMAIL || 'noreply@CivicTrack.local',
        fromName: 'CivicTrack',
      });
    }
    return MailService.instance;
  }

  static initialize(config: MailServiceConfig): MailService {
    MailService.instance = new MailService(config);
    return MailService.instance;
  }

  /**
   * Get user email from Supabase auth
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      const { data: user, error } = await supabase.auth.admin.getUserById(userId);
      if (error) {
        console.warn(`Failed to get user email for ${userId}:`, error);
        return null;
      }
      return user?.user?.email || null;
    } catch (error) {
      console.warn('Error fetching user email:', error);
      return null;
    }
  }

  /**
   * Get user full name from profiles table
   */
  private async getUserName(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn(`Failed to get user name for ${userId}:`, error);
        return null;
      }
      return data?.full_name || null;
    } catch (error) {
      console.warn('Error fetching user name:', error);
      return null;
    }
  }

  /**
   * Send email via the configured provider
   */
  private async sendEmailViaProvider(payload: EmailPayload): Promise<boolean> {
    if (!this.config.enabled) {
      console.warn('Mail service is disabled');
      return false;
    }

    switch (this.config.provider) {
      case EmailProvider.SUPABASE:
        return this.sendViaSupabase(payload);
      case EmailProvider.SENDGRID:
        return this.sendViaSendGrid(payload);
      case EmailProvider.MAILGUN:
        return this.sendViaMailgun(payload);
      case EmailProvider.NODEMAILER:
        return this.sendViaNodemailer(payload);
      default:
        console.error('Unknown email provider:', this.config.provider);
        return false;
    }
  }

  /**
   * Send email via Supabase (if configured)
   * Note: Requires Supabase to have email auth provider configured
   */
  private async sendViaSupabase(payload: EmailPayload): Promise<boolean> {
    try {
      // Supabase doesn't have a built-in email sending API for custom emails
      // This would need to be done via Edge Functions
      console.log('Supabase email sending would require Edge Function implementation');
      console.log('Email payload:', payload);
      return false;
    } catch (error) {
      console.error('Error sending email via Supabase:', error);
      return false;
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(payload: EmailPayload): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        console.error('SendGrid API key not configured');
        return false;
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: {
            email: this.config.fromEmail || 'noreply@CivicTrack.local',
            name: this.config.fromName || 'CivicTrack',
          },
          subject: payload.subject,
          content: [
            { type: 'text/plain', value: payload.text },
            { type: 'text/html', value: payload.html },
          ],
        }),
      });

      if (response.ok) {
        console.log('Email sent successfully via SendGrid');
        return true;
      } else {
        const error = await response.json();
        console.error('SendGrid error:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      return false;
    }
  }

  /**
   * Send email via Mailgun
   */
  private async sendViaMailgun(payload: EmailPayload): Promise<boolean> {
    try {
      if (!this.config.apiKey) {
        console.error('Mailgun API key not configured');
        return false;
      }

      const formData = new FormData();
      formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
      formData.append('to', payload.to);
      formData.append('subject', payload.subject);
      formData.append('html', payload.html);
      formData.append('text', payload.text);

      const response = await fetch(
        `https://api.mailgun.net/v3/${import.meta.env.VITE_MAILGUN_DOMAIN}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        console.log('Email sent successfully via Mailgun');
        return true;
      } else {
        const error = await response.json();
        console.error('Mailgun error:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending email via Mailgun:', error);
      return false;
    }
  }

  /**
   * Send email via Nodemailer (backend API endpoint)
   */
  private async sendViaNodemailer(payload: EmailPayload): Promise<boolean> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/mail/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Email sent successfully via Nodemailer');
        return true;
      } else {
        const error = await response.json();
        console.error('Nodemailer error:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending email via Nodemailer:', error);
      return false;
    }
  }

  /**
   * Send issue resolved notification to user
   */
  async sendIssueResolvedNotification(
    userId: string,
    issueData: {
      title: string;
      description: string;
      category: string;
      location: string;
      resolutionDetails?: string;
      resolvedMessage?: string;
    }
  ): Promise<boolean> {
    try {
      const userEmail = await this.getUserEmail(userId);
      if (!userEmail) {
        console.warn(`Could not find email for user ${userId}`);
        return false;
      }

      const userName = await this.getUserName(userId);
      const recipientName = userName || 'Community Member';

      const emailContent = emailTemplates.issueResolved({
        recipientName,
        issueTitle: issueData.title,
        issueDescription: issueData.description,
        category: issueData.category,
        location: issueData.location,
        resolutionDetails: issueData.resolutionDetails,
        resolvedMessage: issueData.resolvedMessage,
      });

      const payload: EmailPayload = {
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        fromName: this.config.fromName,
      };

      return await this.sendEmailViaProvider(payload);
    } catch (error) {
      console.error('Error sending issue resolved notification:', error);
      return false;
    }
  }

  /**
   * Send issue in progress notification to user
   */
  async sendIssueInProgressNotification(
    userId: string,
    issueData: {
      title: string;
      category: string;
      location: string;
    }
  ): Promise<boolean> {
    try {
      const userEmail = await this.getUserEmail(userId);
      if (!userEmail) {
        console.warn(`Could not find email for user ${userId}`);
        return false;
      }

      const userName = await this.getUserName(userId);
      const recipientName = userName || 'Community Member';

      const emailContent = emailTemplates.issueInProgress({
        recipientName,
        issueTitle: issueData.title,
        issueDescription: '',
        category: issueData.category,
        location: issueData.location,
      });

      const payload: EmailPayload = {
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        fromName: this.config.fromName,
      };

      return await this.sendEmailViaProvider(payload);
    } catch (error) {
      console.error('Error sending issue in progress notification:', error);
      return false;
    }
  }

  /**
   * Send batch email to multiple users (for announcements, etc.)
   */
  async sendBatchEmail(
    userIds: string[],
    emailContent: {
      subject: string;
      html: string;
      text: string;
    }
  ): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };

    for (const userId of userIds) {
      const userEmail = await this.getUserEmail(userId);
      if (!userEmail) {
        results.failed++;
        continue;
      }

      const payload: EmailPayload = {
        to: userEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        fromName: this.config.fromName,
      };

      const success = await this.sendEmailViaProvider(payload);
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Test mail service configuration
   */
  async testConnection(testEmail: string): Promise<boolean> {
    try {
      const testPayload: EmailPayload = {
        to: testEmail,
        subject: 'CivicTrack - Mail Service Test',
        html: '<h1>Test Email</h1><p>This is a test email from CivicTrack mail service.</p>',
        text: 'Test Email\n\nThis is a test email from CivicTrack mail service.',
        fromName: this.config.fromName,
      };

      return await this.sendEmailViaProvider(testPayload);
    } catch (error) {
      console.error('Error testing mail service:', error);
      return false;
    }
  }

  /**
   * Update mail service configuration
   */
  updateConfig(config: Partial<MailServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Omit<MailServiceConfig, 'apiKey'> {
    const { apiKey, ...config } = this.config;
    return config;
  }
}

export default MailService;
