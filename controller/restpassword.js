const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

function genrateresetToken(userId) {
  try {
    if (!userId) {
      throw new Error("User ID required");
    }

    const resetToken = jwt.sign(
      { userId, type: "reset" },
      process.env.Jwt_RESET_TOKEN,
      { expiresIn: "15m" }
    );

    return resetToken;
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate reset token");
  }
}
async function sendResetEmail(toEmail, resetLink, userName = "User") {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - CourseHub LMS</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #374151;
          background: linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #06b6d4 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #e5e7eb;
        }
        
        .header {
          background: linear-gradient(135deg, #374151 0%, #4b5563 50%, #1f2937 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 120px;
          height: 120px;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 50%;
          transform: translate(50%, -50%);
        }
        
        .header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 80px;
          height: 80px;
          background: rgba(6, 182, 212, 0.1);
          border-radius: 50%;
          transform: translate(-50%, 50%);
        }
        
        .logo-container {
          position: relative;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 16px 24px;
          margin-bottom: 20px;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        .logo-text {
          color: #ffffff;
          font-size: 20px;
          font-weight: bold;
        }
        
        .logo-subtitle {
          color: #d1d5db;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .header-title {
          color: #ffffff;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          position: relative;
          z-index: 10;
        }
        
        .header-subtitle {
          color: #d1d5db;
          font-size: 14px;
          margin-top: 8px;
          position: relative;
          z-index: 10;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        
        .security-notice {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          position: relative;
          overflow: hidden;
        }
        
        .security-notice::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #06b6d4, #0891b2);
        }
        
        .security-icon {
          width: 24px;
          height: 24px;
          background: #06b6d4;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          vertical-align: middle;
        }
        
        .security-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .security-text {
          font-size: 14px;
          color: #6b7280;
          margin-left: 36px;
        }
        
        .button-container {
          text-align: center;
          margin: 40px 0;
        }
        
        .reset-button {
          display: inline-block;
          background: linear-gradient(135deg, #374151, #4b5563);
          color: #ffffff !important;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 10px 25px rgba(55, 65, 81, 0.3);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }
        
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(55, 65, 81, 0.4);
          background: linear-gradient(135deg, #4b5563, #374151);
        }
        
        .reset-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .reset-button:hover::before {
          left: 100%;
        }
        
        .alternative-link {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          font-size: 14px;
          color: #6b7280;
          word-break: break-all;
        }
        
        .alternative-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .expiry-notice {
          background: linear-gradient(135deg, #fef3c7, #fed7aa);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          position: relative;
        }
        
        .expiry-notice::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #f59e0b;
        }
        
        .expiry-icon {
          width: 20px;
          height: 20px;
          background: #f59e0b;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .expiry-text {
          font-size: 14px;
          color: #92400e;
          display: flex;
          align-items: center;
        }
        
        .footer {
          background: #f9fafb;
          padding: 30px;
          border-top: 1px solid #e5e7eb;
        }
        
        .footer-content {
          text-align: center;
        }
        
        .footer-title {
          font-size: 16px;
          color: #374151;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .footer-links {
          margin: 20px 0;
        }
        
        .footer-link {
          color: #06b6d4;
          text-decoration: none;
          font-size: 14px;
          margin: 0 15px;
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s ease;
        }
        
        .footer-link:hover {
          border-bottom-color: #06b6d4;
        }
        
        .company-info {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        .social-links {
          margin: 15px 0;
        }
        
        .social-link {
          display: inline-block;
          width: 36px;
          height: 36px;
          background: #e5e7eb;
          border-radius: 8px;
          margin: 0 5px;
          text-align: center;
          line-height: 36px;
          color: #6b7280;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .social-link:hover {
          background: #06b6d4;
          color: white;
          transform: translateY(-2px);
        }
        
        @media only screen and (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 12px;
          }
          
          .header, .content, .footer {
            padding: 25px 20px;
          }
          
          .header-title {
            font-size: 20px;
          }
          
          .reset-button {
            display: block;
            margin: 20px 0;
            padding: 14px 24px;
          }
          
          .logo-container {
            padding: 12px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <div class="logo-container">
            <div class="logo-icon">
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25A8.966 8.966 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
              </svg>
            </div>
            <div>
              <div class="logo-text">CourseHub LMS</div>
              <div class="logo-subtitle">Learn & Grow</div>
            </div>
          </div>
          <h1 class="header-title">Password Reset Request</h1>
          <p class="header-subtitle">Secure password recovery for your account</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <div class="greeting">Hi ${userName},</div>
          
          <div class="message">
            We received a request to reset your password for your CourseHub LMS account. 
            If this was you, click the button below to create a new password. If you didn't 
            request this password reset, you can safely ignore this email.
          </div>
          
          <div class="security-notice">
            <div class="security-title">
              <div class="security-icon">
                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                  <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-2.01L12 1z"/>
                </svg>
              </div>
              Security Notice
            </div>
            <div class="security-text">
              This password reset link is secure and will expire in 15 minutes for your protection. 
              Never share this link with anyone.
            </div>
          </div>
          
          <div class="button-container">
            <a href="${resetLink}" class="reset-button" target="_blank">
              🔐 Reset My Password
            </a>
          </div>
          
          <div class="alternative-link">
            <div class="alternative-title">Can't click the button? Copy and paste this link:</div>
            ${resetLink}
          </div>
          
          <div class="expiry-notice">
            <div class="expiry-text">
              <div class="expiry-icon">⏰</div>
              <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
            </div>
          </div>
          
          <div class="message">
            If you're having trouble accessing your account or didn't request this reset, 
            please contact our support team immediately at 
            <a href="mailto:zain.ali.cs.dev@gmail.com" style="color: #06b6d4;">zain.ali.cs.dev@gmail.com</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <div class="footer-title">Thanks for choosing CourseHub LMS!</div>
            <div class="message" style="margin-bottom: 20px; font-size: 14px;">
              Continue your learning journey with thousands of courses from expert instructors.
            </div>
            
            <div class="footer-links">
              <a href="https://your-app.com/help" class="footer-link">Help Center</a>
              <a href="https://your-app.com/privacy" class="footer-link">Privacy Policy</a>
              <a href="https://your-app.com/terms" class="footer-link">Terms of Service</a>
              <a href="https://your-app.com/contact" class="footer-link">Contact Us</a>
            </div>
            
            <div class="social-links">
              <a href="#" class="social-link">📘</a>
              <a href="#" class="social-link">🐦</a>
              <a href="#" class="social-link">💼</a>
              <a href="#" class="social-link">📸</a>
            </div>
            
            <div class="company-info">
              <div>© 2024 CourseHub LMS. All rights reserved.</div>
              <div style="margin-top: 8px;">
                This email was sent to ${toEmail} because a password reset was requested for your account.
              </div>
              <div style="margin-top: 8px;">
                CourseHub LMS - Empowering learners worldwide
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"CourseHub LMS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Password Reset Request - CourseHub LMS",
    html: htmlTemplate,
    
    text: `
      Hi ${userName},
      
      We received a request to reset your password for your CourseHub LMS account.
      
      Click the link below to reset your password:
      ${resetLink}
      
      This link will expire in 15 minutes for security reasons.
      
      If you didn't request this password reset, you can safely ignore this email.
      
      Need help? Contact us at zain.ali.cs.dev@gmail.com
      
      Thanks,
      CourseHub LMS Team
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { genrateresetToken, sendResetEmail };
