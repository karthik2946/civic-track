/**
 * Supabase Mail Service with Edge Functions
 * 
 * This is an alternative approach using Supabase Edge Functions
 * to send emails directly from the backend.
 */

// supabase/functions/send-email/index.ts
// ============================================================================

/*
To use this, run:
supabase functions new send-email

Then replace the content with the code below:
*/

/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, fromName } = await req.json()

    // Validate inputs
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email using SendGrid or another provider
    const apiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('MAIL_FROM_EMAIL') || 'noreply@civicconnect.local'

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'SendGrid API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: fromEmail,
          name: fromName || 'Civic Connect',
        },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('SendGrid error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
*/

// Deploy with:
// supabase functions deploy send-email --no-verify-jwt

// Then update your mail service to use:
// VITE_MAIL_PROVIDER=nodemailer
// VITE_API_URL=https://<your-project>.functions.supabase.co

export {};
