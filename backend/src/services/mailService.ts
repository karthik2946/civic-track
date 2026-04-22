import nodemailer, { Transporter, TransportOptions } from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
}

export interface MailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
  fromName: string;
}

class MailService {
  private transporter: Transporter | null = null;
  private config: MailServiceConfig | null = null;

  /**
   * Initialize the mail service with SMTP configuration
   */
  async initialize(config: MailServiceConfig): Promise<void> {
    try {
      this.config = config;

      // Create SMTP transporter
      const transportOptions: TransportOptions = {
        host: config.host,
        port: config.port,
        secure: config.secure, // true for 465, false for other ports
        auth: {
          user: config.auth.user,
          pass: config.auth.pass,
        },
      };

      if (config.secure === false && config.port === 587) {
        // For TLS (port 587)
        transportOptions.requireTLS = true;
      }

      this.transporter = nodemailer.createTransport(transportOptions);

      // Verify the connection
      const verified = await this.transporter.verify();
      if (verified) {
        console.log('✅ SMTP connection verified successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize mail service:', error);
      throw error;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter || !this.config) {
        return {
          success: false,
          error: 'Mail service not initialized. Please call initialize() first.',
        };
      }

      const mailOptions = {
        from: `"${options.fromName || this.config.fromName}" <${this.config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent to ${options.to}`);
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Failed to send email:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send email to multiple recipients
   */
  async sendBulkEmail(
    recipients: string[],
    options: Omit<SendEmailOptions, 'to'>
  ): Promise<{ success: boolean; successCount: number; failedCount: number; errors: Record<string, string> }> {
    const errors: Record<string, string> = {};
    let successCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const result = await this.sendEmail({ ...options, to: recipient });
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        errors[recipient] = result.error || 'Unknown error';
      }
    }

    return {
      success: failedCount === 0,
      successCount,
      failedCount,
      errors,
    };
  }

  /**
   * Check if mail service is initialized and ready
   */
  isReady(): boolean {
    return this.transporter !== null && this.config !== null;
  }
}

// Export singleton instance
export const mailService = new MailService();
