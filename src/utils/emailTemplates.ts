import { CORS_ORIGIN } from '@/config/env'

// Use CORS_ORIGIN as frontend URL, fallback to localhost for development
const FRONTEND_URL = CORS_ORIGIN || 'http://localhost:5173'

/**
 * Generate password reset email HTML template
 * Matches the frontend dark theme with white/transparent elements
 */
export const generatePasswordResetEmailTemplate = (resetLink: string, userName?: string): string => {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Galley</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #0d0d0d;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    
    .email-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }
    
    .badge {
      display: inline-block;
      padding: 6px 16px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 20px;
    }
    
    .email-content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 16px;
    }
    
    .message {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .reset-button {
      display: inline-block;
      padding: 14px 32px;
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .reset-button:hover {
      background-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .link-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 24px;
      word-break: break-all;
    }
    
    .link-text a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: underline;
    }
    
    .footer {
      padding: 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.02);
    }
    
    .footer-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 8px;
    }
    
    .footer-link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
    }
    
    .footer-link:hover {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: underline;
    }
    
    .warning {
      background-color: rgba(255, 255, 255, 0.05);
      border-left: 3px solid rgba(255, 255, 255, 0.3);
      padding: 16px;
      border-radius: 8px;
      margin-top: 24px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    @media only screen and (max-width: 600px) {
      .email-container {
        border-radius: 12px;
      }
      
      .email-header,
      .email-content,
      .footer {
        padding: 24px 20px;
      }
      
      .greeting {
        font-size: 20px;
      }
      
      .message {
        font-size: 15px;
      }
      
      .reset-button {
        padding: 12px 24px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo">Galley</div>
      <div class="badge">Password Reset</div>
    </div>
    
    <div class="email-content">
      <div class="greeting">${greeting}</div>
      
      <div class="message">
        We received a request to reset your password for your Galley account. Click the button below to create a new password:
      </div>
      
      <div class="button-container">
        <a href="${resetLink}" class="reset-button">Reset Password</a>
      </div>
      
      <div class="link-text">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetLink}">${resetLink}</a>
      </div>
      
      <div class="warning">
        <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        This email was sent by Galley
      </div>
      <div class="footer-text">
        <a href="${FRONTEND_URL}" class="footer-link">Visit Galley</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate password reset email plain text version
 */
export const generatePasswordResetEmailText = (resetLink: string, userName?: string): string => {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,'
  
  return `
${greeting}

We received a request to reset your password for your Galley account. 

Click the link below to create a new password:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

---
Galley
${FRONTEND_URL}
  `.trim()
}
