/**
 * Mail Service Initialization
 * Initialize the mail service based on environment variables
 */

import MailService, { EmailProvider, MailServiceConfig } from './mailService';

let mailServiceInstance: MailService | null = null;

export function initializeMailService(): MailService {
  if (mailServiceInstance) {
    return mailServiceInstance;
  }

  const config: MailServiceConfig = {
    enabled: import.meta.env.VITE_MAIL_ENABLED === 'true',
    provider: (import.meta.env.VITE_MAIL_PROVIDER as EmailProvider) || EmailProvider.SENDGRID,
    apiKey: import.meta.env.VITE_MAIL_API_KEY,
    fromEmail: import.meta.env.VITE_MAIL_FROM_EMAIL || 'noreply@CivicTrack.local',
    fromName: import.meta.env.VITE_MAIL_FROM_NAME || 'CivicTrack',
  };

  mailServiceInstance = MailService.initialize(config);
  
  if (config.enabled) {
    console.log(`Mail service initialized with provider: ${config.provider}`);
  } else {
    console.warn('Mail service is disabled. Set VITE_MAIL_ENABLED=true to enable');
  }

  return mailServiceInstance;
}

export function getMailService(): MailService {
  if (!mailServiceInstance) {
    return initializeMailService();
  }
  return mailServiceInstance;
}
