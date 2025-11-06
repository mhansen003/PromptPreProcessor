import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { AUTH_CONFIG } from './auth-jwt';

// Generate random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Singleton transporter with connection pooling
let transporter: Transporter | null = null;

// Create email transporter with connection pooling
export function createEmailTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured');
  }

  // Return existing transporter if available
  if (transporter) {
    return transporter;
  }

  // Create new transporter with Gmail SMTP settings
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Connection pooling for faster emails
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
}

// Send OTP email
export async function sendOTPEmail(email: string, code: string): Promise<void> {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: `"PromptPreProcessor" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your PromptPreProcessor Access Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #0A0A0A;
              color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #1A1A1A;
              border-radius: 12px;
              border: 1px solid #2A2A2A;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #00C805 0%, #00FF88 100%);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              color: #0A0A0A;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
            }
            .code-box {
              background: rgba(0, 200, 5, 0.1);
              border: 2px solid #00C805;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #00C805;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background: rgba(255, 107, 53, 0.1);
              border-left: 4px solid #FF6B35;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background: rgba(255, 255, 255, 0.05);
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ PromptPreProcessor</h1>
            </div>
            <div class="content">
              <h2 style="color: #00C805; margin-top: 0;">Your Access Code</h2>
              <p>Hello! Someone requested access to PromptPreProcessor using this email address.</p>

              <div class="code-box">
                <div style="color: #999; font-size: 12px; margin-bottom: 10px;">VERIFICATION CODE</div>
                <div class="code">${code}</div>
                <div style="color: #999; font-size: 12px; margin-top: 10px;">Valid for ${AUTH_CONFIG.OTP_EXPIRY_MINUTES} minutes</div>
              </div>

              <p>Enter this code on the login page to access your prompt configurations.</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This code expires in ${AUTH_CONFIG.OTP_EXPIRY_MINUTES} minutes<br>
                • You have ${AUTH_CONFIG.MAX_ATTEMPTS} attempts to enter it correctly<br>
                • If you didn't request this code, please ignore this email
              </div>

              <p style="margin-top: 30px; color: #999; font-size: 14px;">
                <strong>Need help?</strong> Contact your IT administrator.
              </p>
            </div>
            <div class="footer">
              <p>CMG Financial - PromptPreProcessor</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Your PromptPreProcessor Access Code: ${code}

This code will expire in ${AUTH_CONFIG.OTP_EXPIRY_MINUTES} minutes.

If you didn't request this code, please ignore this email.

CMG Financial - PromptPreProcessor
    `,
  };

  await transporter.sendMail(mailOptions);
}
