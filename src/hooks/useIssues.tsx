import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getMailService } from '@/services/mailServiceInit';
import { CATEGORY_LABELS } from '@/types/issue';

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
  updateIssueStatus: (id: string, status: string, assignedTo?: string, resolutionDetails?: string, resolvedMessage?: string) => Promise<void>;
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
      // Fetch issues - RLS will handle filtering based on role
      const { data: issuesData, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching issues:', error);
        return;
      }

      // For authorities, fetch reporter names
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

    // Refresh issues list
    await fetchIssues();
    return newIssue;
  };

  const updateIssueStatus = async (id: string, status: string, assignedTo?: string, resolutionDetails?: string, resolvedMessage?: string) => {
    const updateData: { status: string; assigned_to?: string; resolved_at?: string | null } = { status };
    
    if (assignedTo) {
      updateData.assigned_to = assignedTo;
    }
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating issue:', error);
      return;
    }

    // Send email notification if issue is resolved
    if (status === 'resolved') {
      try {
        const issue = issues.find(i => i.id === id);
        if (issue) {
          const mailService = getMailService();
          const categoryLabel = CATEGORY_LABELS[issue.category as keyof typeof CATEGORY_LABELS] || issue.category;
          const location = issue.address || 'Location not specified';

          const success = await mailService.sendIssueResolvedNotification(
            issue.user_id,
            {
              title: issue.title,
              description: issue.description,
              category: categoryLabel,
              location: location,
              resolutionDetails: resolutionDetails,
              resolvedMessage: resolvedMessage,
            }
          );

          if (success) {
            console.log(`Email notification sent for issue ${id}`);
          } else {
            console.warn(`Failed to send email notification for issue ${id}`);
          }
        }
      } catch (err) {
        console.error('Error sending email notification:', err);
      }
    }

    // Refresh issues list
    await fetchIssues();
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
