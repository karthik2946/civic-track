-- Email Logs Table
-- Migration for storing email sending history and status

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  issue_id UUID NOT NULL,
  email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('issue_resolved', 'issue_in_progress', 'general')),
  recipient_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'bounced')),
  error_message TEXT,
  subject VARCHAR(255),
  attempts INTEGER DEFAULT 1,
  last_error_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_issue_id ON public.email_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- Create unique index to prevent duplicate records
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_logs_unique 
  ON public.email_logs(user_id, issue_id, email_type) 
  WHERE status = 'success';

-- Enable Row Level Security (RLS)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view their own email logs
CREATE POLICY "Users can view their own email logs" 
  ON public.email_logs 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Allow service role to insert logs
CREATE POLICY "Service role can insert email logs" 
  ON public.email_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Allow service role to update logs
CREATE POLICY "Service role can update email logs" 
  ON public.email_logs 
  FOR UPDATE 
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS email_logs_update_timestamp ON public.email_logs;
CREATE TRIGGER email_logs_update_timestamp 
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_updated_at();

-- Create view for email analytics
CREATE OR REPLACE VIEW email_send_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  email_type,
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced_count
FROM public.email_logs
GROUP BY 1, 2, 3;

