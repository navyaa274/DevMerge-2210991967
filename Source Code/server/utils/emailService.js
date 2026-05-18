const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Email Service for AI University Platform
 * Handles transactional emails with HTML templates
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      // Check if email configuration is available
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured. Using  email service.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
        }
      });

      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send email using template
   */
  async sendEmail({ to, subject, template, data = {}, html = null, attachments = [] }) {
    try {
      if (!this.isConfigured) {
        throw new Error('Email service not configured');
      }

      // Generate HTML content from template if not provided
      const htmlContent = html || await this.generateTemplate(template, data);

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'AI University Platform'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Generate HTML from template
   */
  async generateTemplate(template, data) {
    try {
      const templatePath = path.join(__dirname, '../templates', `${template}.html`);

      // Check if template file exists
      try {
        await fs.access(templatePath);
      } catch {
        // Use default template if specific template doesn't exist
        return this.generateDefaultTemplate(data);
      }

      let templateContent = await fs.readFile(templatePath, 'utf8');

      // Replace template variables with HTML escaping
      const urlFields = new Set(['actionUrl', 'unsubscribeUrl', 'logoUrl']);
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = data[key] || '';
        // Don't escape URL fields, but escape all other user-provided data
        const safeValue = urlFields.has(key) ? value : this.escapeHtml(String(value));
        templateContent = templateContent.replace(regex, safeValue);
      });

      return templateContent;
    } catch (error) {
      console.error('Failed to generate template:', error);
      return this.generateDefaultTemplate(data);
    }
  }

  /**
   * Escape HTML special characters to prevent injection
   */
  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Generate default HTML template
   */
  generateDefaultTemplate(data = {}) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject || 'AI University Platform'}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 12px;
            color: #6c757d;
          }
          .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${data.platformName || 'AI University Platform'}</div>
            <p>${data.tagline || 'Empowering Education with AI'}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.firstName || 'User'},</h2>
            
            ${data.greetingMessage || `<p>${data.message || 'Thank you for using our platform.'}</p>`}
            
            ${data.actionUrl ? `<p><a href="${data.actionUrl}" class="button">${data.actionText || 'Click Here'}</a></p>` : ''}
            
            ${data.highlightText ? `<div class="highlight">${data.highlightText}</div>` : ''}
            
            ${data.additionalInfo || ''}
          </div>
          
          <div class="footer">
            <p>This email was sent by ${data.platformName || 'AI University Platform'}</p>
            <p>If you didn't request this email, please ignore it.</p>
            <p>© ${new Date().getFullYear()} ${data.platformName || 'AI University Platform'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send assignment notification (legacy compatibility)
   */
  async sendAssignmentNotification(studentEmail, studentName, assignmentTitle, dueDate) {
    return this.sendEmail({
      to: studentEmail,
      subject: `New Assignment: ${assignmentTitle}`,
      template: 'assignment-notification',
      data: {
        firstName: studentName,
        assignmentTitle,
        dueDate: new Date(dueDate).toLocaleDateString(),
        platformName: 'AI University Platform',
        greetingMessage: `A new assignment has been assigned to you: ${assignmentTitle}`,
        actionUrl: `${process.env.CLIENT_URL || process.env.FRONTEND_URL}/assignments`,
        actionText: 'View Assignment',
        additionalInfo: `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>`
      }
    });
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export the sendEmail function and legacy compatibility
module.exports = {
  sendEmail: emailService.sendEmail.bind(emailService),
  sendAssignmentNotification: emailService.sendAssignmentNotification.bind(emailService)
};

