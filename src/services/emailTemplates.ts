/**
 * Email Templates for CivicTrack Mail Service
 */

export interface EmailTemplateData {
  recipientName: string;
  issueTitle: string;
  issueDescription: string;
  category: string;
  location: string;
  resolvedMessage?: string;
  resolutionDetails?: string;
}

export const emailTemplates = {
  issueResolved: (data: EmailTemplateData) => {
    const { recipientName, issueTitle, issueDescription, category, location, resolvedMessage, resolutionDetails } = data;

    return {
      subject: `✅ Your Report Has Been Resolved - ${issueTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: #f9fafb;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 40px 20px;
                background: white;
              }
              .greeting {
                font-size: 16px;
                margin-bottom: 20px;
              }
              .issue-card {
                background: #f3f4f6;
                border-left: 4px solid #10b981;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .issue-card h3 {
                margin: 0 0 10px 0;
                color: #10b981;
              }
              .issue-detail {
                margin: 8px 0;
              }
              .label {
                font-weight: 600;
                color: #6b7280;
              }
              .resolution-section {
                background: #ecfdf5;
                border: 1px solid #a7f3d0;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .resolution-section h4 {
                margin: 0 0 10px 0;
                color: #10b981;
              }
              .footer {
                background: #f3f4f6;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
              }
              .button {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Issue Resolved</h1>
                <p>Thank you for reporting this issue!</p>
              </div>
              
              <div class="content">
                <div class="greeting">
                  <p>Hi ${recipientName},</p>
                  <p>We're pleased to inform you that your reported issue has been resolved.</p>
                </div>

                <div class="issue-card">
                  <h3>${issueTitle}</h3>
                  <div class="issue-detail">
                    <span class="label">Description:</span>
                    <p>${issueDescription}</p>
                  </div>
                  <div class="issue-detail">
                    <span class="label">Category:</span>
                    <p>${category}</p>
                  </div>
                  <div class="issue-detail">
                    <span class="label">Location:</span>
                    <p>${location}</p>
                  </div>
                </div>

                ${resolutionDetails ? `
                <div class="resolution-section">
                  <h4>Resolution Details</h4>
                  <p>${resolutionDetails}</p>
                  ${resolvedMessage ? `<p><strong>Message from Authority:</strong> ${resolvedMessage}</p>` : ''}
                </div>
                ` : ''}

                <p>Your feedback helps us improve our city services. If you have any concerns about this resolution or notice the issue persists, please don't hesitate to report it again.</p>

                <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/" class="button">
                  View Dashboard
                </a>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  Thank you for being an active member of our community!<br>
                  <strong>CivicTrack Team</strong>
                </p>
              </div>

              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this email.</p>
                <p>&copy; 2024 CivicTrack. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${recipientName},

We're pleased to inform you that your reported issue has been resolved.

ISSUE DETAILS:
Title: ${issueTitle}
Description: ${issueDescription}
Category: ${category}
Location: ${location}

${resolutionDetails ? `RESOLUTION DETAILS:\n${resolutionDetails}\n\n` : ''}
${resolvedMessage ? `Message from Authority: ${resolvedMessage}\n\n` : ''}

Your feedback helps us improve our city services. If you have any concerns about this resolution or notice the issue persists, please don't hesitate to report it again.

Thank you for being an active member of our community!

CivicTrack Team

---
This is an automated email. Please do not reply directly to this email.
© 2024 CivicTrack. All rights reserved.
      `
    };
  },

  issueInProgress: (data: EmailTemplateData) => {
    const { recipientName, issueTitle, category, location } = data;

    return {
      subject: `🔧 Your Issue is Being Worked On - ${issueTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: #f9fafb;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 40px 20px;
                background: white;
              }
              .issue-card {
                background: #f3f4f6;
                border-left: 4px solid #f59e0b;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                background: #f3f4f6;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔧 In Progress</h1>
                <p>Our team is working on your issue</p>
              </div>
              
              <div class="content">
                <p>Hi ${recipientName},</p>
                <p>We wanted to let you know that your reported issue has been assigned to our team and work has begun.</p>

                <div class="issue-card">
                  <h3>${issueTitle}</h3>
                  <p><strong>Category:</strong> ${category}</p>
                  <p><strong>Location:</strong> ${location}</p>
                  <p>We'll keep you updated on the progress and will notify you once it's resolved.</p>
                </div>

                <p>We appreciate your patience and community engagement!</p>
              </div>

              <div class="footer">
                <p>This is an automated email. Please do not reply directly to this email.</p>
                <p>&copy; 2024 CivicTrack. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${recipientName},

We wanted to let you know that your reported issue has been assigned to our team and work has begun.

ISSUE: ${issueTitle}
Category: ${category}
Location: ${location}

We'll keep you updated on the progress and will notify you once it's resolved.

Thank you for your patience and community engagement!

CivicTrack Team
      `
    };
  }
};
