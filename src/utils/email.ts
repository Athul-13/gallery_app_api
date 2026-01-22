import nodemailer from 'nodemailer'
import { logger } from '@/config/logger'
import { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM, NODE_ENV } from '@/config/env'

/**
 * Email transporter - only initialized if SMTP is configured
 */
let transporter: nodemailer.Transporter | null = null

/**
 * Initialize email transporter
 * Only sets up real SMTP if configured, otherwise emails will be logged in development
 */
export const initializeEmailTransporter = async (): Promise<void> => {
  // Only initialize if SMTP is fully configured
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: SMTP_SECURE === 'true',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })

      await transporter.verify()
      logger.info('✅ Email transporter initialized successfully')
    } catch (error) {
      logger.error('❌ Failed to initialize email transporter:', error)
      transporter = null
    }
  } else {
    if (NODE_ENV === 'development') {
      logger.info('📧 Email mode: Development (reset links will be logged to console)')
      logger.info('💡 To send real emails, configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS')
    } else {
      logger.warn('⚠️  Email configuration not found. Email sending will be disabled.')
    }
  }
}

/**
 * Send email
 * In development without SMTP: logs the email content and reset link
 * In production with SMTP: sends actual email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email body
 * @param text - Plain text email body (optional)
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  // If SMTP is configured, send real email
  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      })
      logger.info(`Email sent successfully to ${to}`)
      return
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error)
      throw new Error('Failed to send email')
    }
  }

  // In development, just log the email details (no real email needed)
  if (NODE_ENV === 'development') {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info(`📧 Email would be sent to: ${to}`)
    logger.info(`📌 Subject: ${subject}`)
    
    // Extract reset link from HTML
    const linkMatch = html.match(/href="([^"]+)"/)
    if (linkMatch) {
      logger.info(`🔗 Reset Link: ${linkMatch[1]}`)
    }
    
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info('💡 In development, copy the reset link above to test password reset')
    return
  }

  // In production without SMTP, warn but don't fail
  logger.warn(`Email not sent to ${to}: SMTP not configured`)
}

/**
 * Get email transporter instance
 */
export const getEmailTransporter = (): nodemailer.Transporter | null => {
  return transporter
}
