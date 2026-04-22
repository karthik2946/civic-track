/**
 * Mail Service Integration
 * This module provides utilities to integrate the mail service with issue updates
 */

import MailService, { EmailProvider, MailServiceConfig } from './mailService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize mail service with configuration from environment variables
 */
export const initializeMailService = (): MailService => {
  const provider = (import.meta.env.VITE_MAIL_PROVIDER || 'supabase') as EmailProvider;
  
  const config: MailServiceConfig = {
    enabled: import.meta.env.VITE_MAIL_ENABLED === 'true',
    provider,
    apiKey: import.meta.env.VITE_MAIL_API_KEY,
    fromEmail: import.meta.env.VITE_MAIL_FROM_EMAIL || 'noreply@CivicTrack.local',
    fromName: import.meta.env.VITE_MAIL_FROM_NAME || 'CivicTrack',
  };

  return MailService.initialize(config);
};

/**
 * Get the mail service instance (singleton)
 */
export const getMailService = (): MailService => {
  return MailService.getInstance();
};

/**
 * Send notification when an issue is marked as resolved
 */
export const notifyIssueResolved = async (
  userId: string,
  issueId: string,
  issueData: {
    title: string;
    description: string;
    category: string;
    address: string;
    resolutionDetails?: string;
    resolvedMessage?: string;
  }
): Promise<boolean> => {
  const mailService = getMailService();

  try {
    const success = await mailService.sendIssueResolvedNotification(userId, {
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      location: issueData.address,
      resolutionDetails: issueData.resolutionDetails,
      resolvedMessage: issueData.resolvedMessage,
    });

    if (success) {
      // Log email sent in Supabase for record-keeping
      await logEmailSent(userId, issueId, 'issue_resolved', 'success');
    } else {
      await logEmailSent(userId, issueId, 'issue_resolved', 'failed');
    }

    return success;
  } catch (error) {
    console.error('Error notifying issue resolved:', error);
    await logEmailSent(userId, issueId, 'issue_resolved', 'error');
    return false;
  }
};

/**
 * Send notification when an issue is marked as in progress
 */
export const notifyIssueInProgress = async (
  userId: string,
  issueId: string,
  issueData: {
    title: string;
    category: string;
    address: string;
  }
): Promise<boolean> => {
  const mailService = getMailService();

  try {
    const success = await mailService.sendIssueInProgressNotification(userId, {
      title: issueData.title,
      category: issueData.category,
      location: issueData.address,
    });

    if (success) {
      await logEmailSent(userId, issueId, 'issue_in_progress', 'success');
    } else {
      await logEmailSent(userId, issueId, 'issue_in_progress', 'failed');
    }

    return success;
  } catch (error) {
    console.error('Error notifying issue in progress:', error);
    await logEmailSent(userId, issueId, 'issue_in_progress', 'error');
    return false;
  }
};

/**
 * Log email sending attempts in Supabase for tracking
 * (Create a new table for this: email_logs)
 */
const logEmailSent = async (
  userId: string,
  issueId: string,
  emailType: string,
  status: 'success' | 'failed' | 'error'
): Promise<void> => {
  try {
    // This assumes you have an email_logs table in Supabase
    // If you don't, create it with: CREATE TABLE email_logs (...)
    const { error } = await supabase.from('email_logs').insert({
      user_id: userId,
      issue_id: issueId,
      email_type: emailType,
      status,
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Failed to log email:', error);
    }
  } catch (error) {
    console.warn('Error logging email:', error);
  }
};

/**
 * Resend a previously failed email
 */
export const resendFailedEmail = async (emailLogId: string): Promise<boolean> => {
  try {
    const { data: emailLog, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('id', emailLogId)
      .single();

    if (error || !emailLog) {
      console.error('Email log not found:', error);
      return false;
    }

    // Fetch issue data
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', emailLog.issue_id)
      .single();

    if (issueError || !issue) {
      console.error('Issue not found:', issueError);
      return false;
    }

    const mailService = getMailService();
    let success = false;

    if (emailLog.email_type === 'issue_resolved') {
      success = await mailService.sendIssueResolvedNotification(emailLog.user_id, {
        title: issue.title,
        description: issue.description,
        category: issue.category,
        location: issue.address,
      });
    } else if (emailLog.email_type === 'issue_in_progress') {
      success = await mailService.sendIssueInProgressNotification(emailLog.user_id, {
        title: issue.title,
        category: issue.category,
        location: issue.address,
      });
    }

    if (success) {
      await supabase
        .from('email_logs')
        .update({ status: 'success', updated_at: new Date().toISOString() })
        .eq('id', emailLogId);
    }

    return success;
  } catch (error) {
    console.error('Error resending email:', error);
    return false;
  }
};
