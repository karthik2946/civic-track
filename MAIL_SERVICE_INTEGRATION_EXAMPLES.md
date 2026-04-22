/**
 * INTEGRATION EXAMPLE: useIssues Hook with Mail Service
 * 
 * This shows how to modify your existing useIssues hook to send email
 * notifications when issues are updated.
 * 
 * Replace the updateIssueStatus function in src/hooks/useIssues.tsx
 * with the code shown below.
 */

// Option 1: Simple Integration (Add to existing useIssues.tsx)
// ============================================================================

/*
import { notifyIssueResolved, notifyIssueInProgress } from '@/services/mailServiceIntegration';

const updateIssueStatus = async (id: string, status: string, assignedTo?: string) => {
  // Get the issue before updating
  const issueToUpdate = issues.find(i => i.id === id);
  if (!issueToUpdate) {
    console.error('Issue not found');
    return;
  }

  const updateData: { status: string; assigned_to?: string; resolved_at?: string | null } = { status };
  
  if (assignedTo) {
    updateData.assigned_to = assignedTo;
  }
  
  if (status === 'resolved') {
    updateData.resolved_at = new Date().toISOString();
  }

  try {
    const { error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating issue:', error);
      return;
    }

    // Send email notification based on status change
    if (status === 'resolved') {
      // Send issue resolved notification
      await notifyIssueResolved(
        issueToUpdate.user_id,
        id,
        {
          title: issueToUpdate.title,
          description: issueToUpdate.description,
          category: issueToUpdate.category,
          address: issueToUpdate.address || 'Unknown Location',
          resolutionDetails: 'Your reported issue has been successfully resolved.',
        }
      );
    } else if (status === 'in_progress' && issueToUpdate.status !== 'in_progress') {
      // Send in progress notification (only if changing to in_progress)
      await notifyIssueInProgress(
        issueToUpdate.user_id,
        id,
        {
          title: issueToUpdate.title,
          category: issueToUpdate.category,
          address: issueToUpdate.address || 'Unknown Location',
        }
      );
    }

    // Refresh issues list
    await fetchIssues();
  } catch (error) {
    console.error('Error in updateIssueStatus:', error);
  }
};
*/

// ============================================================================
// INTEGRATION EXAMPLE: AuthorityDashboard with Mail Service
// ============================================================================

/*
Add this function to your AuthorityDashboard.tsx component:

import { notifyIssueResolved } from '@/services/mailServiceIntegration';
import { useToast } from '@/hooks/use-toast';

const handleResolveIssueWithNotification = async (issue: Issue) => {
  const { toast } = useToast();
  
  try {
    // Show loading toast
    const loadingToast = toast({
      title: 'Resolving issue...',
      description: 'Sending notification to reporter...',
    });

    // Update status to resolved
    await updateIssueStatus(issue.id, 'resolved');

    // Send email notification
    const emailSent = await notifyIssueResolved(
      issue.user_id,
      issue.id,
      {
        title: issue.title,
        description: issue.description,
        category: issue.category,
        address: issue.address || 'Unknown Location',
        resolutionDetails: 'Your reported issue has been successfully resolved by our maintenance team.',
      }
    );

    // Dismiss loading toast and show success
    loadingToast.dismiss();
    
    if (emailSent) {
      toast({
        title: 'Success',
        description: 'Issue resolved and notification email sent to reporter.',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Partial Success',
        description: 'Issue resolved, but failed to send notification email.',
        variant: 'default',
      });
    }

    // Close the issue detail modal
    setSelectedIssue(null);

  } catch (error) {
    console.error('Error resolving issue:', error);
    toast({
      title: 'Error',
      description: 'Failed to resolve issue.',
      variant: 'destructive',
    });
  }
};
*/

// ============================================================================
// INITIALIZATION IN App.tsx OR main.tsx
// ============================================================================

/*
Add mail service initialization to your App.tsx or main.tsx:

import { initializeMailService } from '@/services/mailServiceIntegration';

// Initialize mail service when app starts
initializeMailService();

// In your main render/layout
export function App() {
  // ... rest of your app
  return (
    <IssuesProvider>
      {/* your app content */}
    </IssuesProvider>
  );
}
*/

// ============================================================================
// DASHBOARD TO SEND EMAILS MANUALLY
// ============================================================================

/*
Create a new page/component for administrators to manage email logs and resend failed emails:

// pages/AdminMailDashboard.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { resendFailedEmail } from '@/services/mailServiceIntegration';
import { toast } from 'sonner';

export function AdminMailDashboard() {
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching email logs:', error);
        return;
      }

      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async (emailLogId: string) => {
    const success = await resendFailedEmail(emailLogId);
    
    if (success) {
      toast.success('Email sent successfully');
      await fetchEmailLogs();
    } else {
      toast.error('Failed to send email');
    }
  };

  const failedEmails = emailLogs.filter(log => log.status === 'failed' || log.status === 'error');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Email Service Dashboard</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{emailLogs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {emailLogs.filter(e => e.status === 'success').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {failedEmails.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Emails Section */}
      {failedEmails.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Failed Emails - Resend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {failedEmails.map(log => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{log.email_type}</p>
                    <p className="text-sm text-gray-500">{log.error_message || 'Unknown error'}</p>
                    <p className="text-xs text-gray-400">{new Date(log.sent_at).toLocaleString()}</p>
                  </div>
                  <Button 
                    onClick={() => handleResendEmail(log.id)}
                    variant="outline"
                    size="sm"
                  >
                    Resend
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Emails Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{log.email_type}</td>
                    <td className="py-2 px-2">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-gray-500">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
*/

export {};
