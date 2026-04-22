/**
 * Updated useIssues Hook with Mail Service Integration
 * 
 * Copy this updated updateIssueStatus function into your src/hooks/useIssues.tsx
 * Replace the existing updateIssueStatus function with this version.
 */

// ============================================================================
// COMPLETE UPDATED useIssues.tsx
// ============================================================================

/*
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { notifyIssueResolved, notifyIssueInProgress } from '@/services/mailServiceIntegration';

interface Issue {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  reporter_name?: string;
}

interface NewIssueData {
  title: string;
  description: string;
  category: string;
  priority: string;
  address?: string;
  lat?: number;
  lng?: number;
  image_url?: string;
}

interface IssuesContextType {
  issues: Issue[];
  isLoading: boolean;
  addIssue: (data: NewIssueData) => Promise<Issue | null>;
  updateIssueStatus: (id: string, status: string, assignedTo?: string) => Promise<void>;
  refreshIssues: () => Promise<void>;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role } = useAuth();

  const fetchIssues = async () => {
    if (!user) {
      setIssues([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: issuesData, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching issues:', error);
        return;
      }

      if (role === 'authority' && issuesData) {
        const userIds = [...new Set(issuesData.map(i => i.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        const issuesWithNames = issuesData.map(issue => ({
          ...issue,
          reporter_name: profileMap.get(issue.user_id) || 'Unknown User',
        }));
        
        setIssues(issuesWithNames);
      } else {
        setIssues(issuesData || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [user, role]);

  const addIssue = async (data: NewIssueData): Promise<Issue | null> => {
    if (!user) return null;

    const { data: newIssue, error } = await supabase
      .from('issues')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        address: data.address || null,
        lat: data.lat || null,
        lng: data.lng || null,
        image_url: data.image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating issue:', error);
      return null;
    }

    await fetchIssues();
    return newIssue;
  };

  // ====================================================================
  // UPDATED: NEW updateIssueStatus WITH MAIL SERVICE INTEGRATION
  // ====================================================================
  const updateIssueStatus = async (id: string, status: string, assignedTo?: string) => {
    // Get the issue before updating (needed for email notification)
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

      // MAIL SERVICE INTEGRATION: Send email notifications based on status change
      try {
        if (status === 'resolved') {
          // Send issue resolved notification to reporter
          const emailSent = await notifyIssueResolved(
            issueToUpdate.user_id,
            id,
            {
              title: issueToUpdate.title,
              description: issueToUpdate.description,
              category: issueToUpdate.category,
              address: issueToUpdate.address || 'Unknown Location',
              resolutionDetails: 'Your reported issue has been successfully resolved by our maintenance team.',
            }
          );

          if (emailSent) {
            console.log('✅ Issue resolved email sent to reporter');
          } else {
            console.warn('⚠️ Failed to send issue resolved email');
          }
        } else if (status === 'in_progress' && issueToUpdate.status !== 'in_progress') {
          // Send in progress notification (only if transitioning TO in_progress)
          const emailSent = await notifyIssueInProgress(
            issueToUpdate.user_id,
            id,
            {
              title: issueToUpdate.title,
              category: issueToUpdate.category,
              address: issueToUpdate.address || 'Unknown Location',
            }
          );

          if (emailSent) {
            console.log('✅ Issue in progress email sent to reporter');
          } else {
            console.warn('⚠️ Failed to send issue in progress email');
          }
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Don't fail the status update if email fails
      }

      // Refresh issues list
      await fetchIssues();
    } catch (error) {
      console.error('Error in updateIssueStatus:', error);
    }
  };

  const refreshIssues = async () => {
    await fetchIssues();
  };

  return (
    <IssuesContext.Provider value={{ issues, isLoading, addIssue, updateIssueStatus, refreshIssues }}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssuesContext() {
  const context = useContext(IssuesContext);
  if (context === undefined) {
    throw new Error('useIssuesContext must be used within an IssuesProvider');
  }
  return context;
}
*/

// ============================================================================
// MINIMAL CHANGES (if you want to make minimal modifications)
// ============================================================================

/*
Just add this to the updateIssueStatus function after the supabase update:

import { notifyIssueResolved } from '@/services/mailServiceIntegration';

// After successful supabase update:
if (status === 'resolved') {
  await notifyIssueResolved(issueToUpdate.user_id, id, {
    title: issueToUpdate.title,
    description: issueToUpdate.description,
    category: issueToUpdate.category,
    address: issueToUpdate.address || 'Unknown Location',
  });
}
*/

// ============================================================================
// INTEGRATION IN AuthorityDashboard.tsx
// ============================================================================

/*
Add this function to your AuthorityDashboard component:

import { toast } from 'sonner';
import { notifyIssueResolved } from '@/services/mailServiceIntegration';

// Add this near your handleStatusChange function
const handleResolveIssueWithEmail = async (issue: Issue) => {
  try {
    // Update status
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
        resolutionDetails: 'Your reported issue has been successfully resolved.',
      }
    );

    // Show appropriate toast
    if (emailSent) {
      toast.success('Issue resolved! Reporter notified via email.');
    } else {
      toast.success('Issue resolved, but email notification failed.');
    }

    setSelectedIssue(null);
  } catch (error) {
    console.error('Error resolving issue:', error);
    toast.error('Failed to resolve issue');
  }
};

// Use it in your resolve button
<Button 
  onClick={() => handleResolveIssueWithEmail(selectedIssue)}
  className="bg-green-600 hover:bg-green-700"
>
  Resolve & Notify Reporter
</Button>
*/

// ============================================================================
// INITIALIZATION IN main.tsx
// ============================================================================

/*
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeMailService } from '@/services/mailServiceIntegration'

// Initialize mail service on app startup
const mailService = initializeMailService()
console.log('Mail service initialized:', mailService.getConfig())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
*/

// ============================================================================
// ENV CONFIGURATION TEMPLATE
// ============================================================================

/*
Add to your .env file:

# Mail Service Configuration
VITE_MAIL_ENABLED=true
VITE_MAIL_PROVIDER=sendgrid
VITE_MAIL_API_KEY=SG.your_sendgrid_api_key_here
VITE_MAIL_FROM_EMAIL=noreply@civicconnect.local
VITE_MAIL_FROM_NAME=Civic Connect
VITE_APP_URL=http://localhost:5173

# Optional: For Nodemailer backend
VITE_API_URL=http://localhost:3001

# Optional: For Mailgun
VITE_MAILGUN_DOMAIN=mg.yourdomain.com
*/

export {};
