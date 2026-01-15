import { 
  IPasswordResetInput, 
  IPasswordResetTokenPayload,
  createError,
} from '@/types'
import { IUserRepository } from '@/repositories/interface'
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/utils/password'
import { verifyToken, generatePasswordResetToken } from '@/utils/jwt'
import { logger } from '@/config/logger'
import { sendEmail } from '@/utils/email'
import { generatePasswordResetEmailTemplate, generatePasswordResetEmailText } from '@/utils/emailTemplates'
import { CORS_ORIGIN } from '@/config/env'
import { IPasswordService } from './interface'

// Use CORS_ORIGIN as frontend URL, fallback to localhost for development
const FRONTEND_URL = CORS_ORIGIN || 'http://localhost:5173'

/**
 * Password service
 * Handles password reset and password change operations
 */
export class PasswordService implements IPasswordService {
  constructor(
    private repo: IUserRepository
  ) {}

  /**
   * Request password reset (generates reset token)
   * @param email - User email
   * @returns Password reset token
   */
  async requestPasswordReset(email: string) {
    const user = await this.repo.findByEmail(email)
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`)
      return { message: 'If the email exists, a password reset link has been sent' }
    }

    const resetToken = generatePasswordResetToken({
      userId: user._id.toString(),
      email: user.email,
      type: 'password-reset',
    })

    // Generate reset link
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`

    // Send password reset email
    try {
      const htmlTemplate = generatePasswordResetEmailTemplate(resetLink, user.email.split('@')[0])
      const textTemplate = generatePasswordResetEmailText(resetLink, user.email.split('@')[0])
      
      await sendEmail(
        user.email,
        'Reset Your Password - Galley',
        htmlTemplate,
        textTemplate
      )
      
      logger.info(`Password reset email sent to: ${user.email}`)
    } catch (error) {
      logger.error(`Failed to send password reset email to ${user.email}:`, error)
      // Still return success message to prevent email enumeration
    }

    // In development, also return the token for testing
    return {
      message: 'If the email exists, a password reset link has been sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    }
  }

  /**
   * Reset password using reset token
   * @param resetData - Password reset data (token and new password)
   * @returns Success message
   */
  async resetPassword(resetData: IPasswordResetInput) {
    const { token, newPassword } = resetData

    const payload = verifyToken<IPasswordResetTokenPayload>(token)
    
    if (payload.type !== 'password-reset') {
      throw createError(401, 'Invalid token type')
    }

    const user = await this.repo.findById(payload.userId, true)
    if (!user) {
      throw createError(404, 'User not found')
    }

    const passwordValidation = validatePasswordStrength(newPassword, 6)
    if (!passwordValidation.isValid) {
      throw createError(400, `Password does not meet requirements: ${passwordValidation.feedback.join(', ')}`)
    }

    const isSamePassword = await verifyPassword(user.password, newPassword)
    if (isSamePassword) {
      throw createError(400, 'New password must be different from current password')
    }

    const hashedPassword = await hashPassword(newPassword)
    await this.repo.updatePassword(payload.userId, hashedPassword)

    logger.info(`Password reset successful for: ${user.email}`)

    return {
      message: 'Password reset successful',
    }
  }

  /**
   * Change password for authenticated user
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Success message
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const isCurrentPasswordValid = await this.repo.verifyPassword(userId, currentPassword)
    if (!isCurrentPasswordValid) {
      throw createError(401, 'Current password is incorrect')
    }

    const user = await this.repo.findById(userId)
    if (!user) {
      throw createError(404, 'User not found')
    }

    const passwordValidation = validatePasswordStrength(newPassword, 6)
    if (!passwordValidation.isValid) {
      throw createError(400, `Password does not meet requirements: ${passwordValidation.feedback.join(', ')}`)
    }

    const isSamePassword = await this.repo.verifyPassword(userId, newPassword)
    if (isSamePassword) {
      throw createError(400, 'New password must be different from current password')
    }

    const hashedPassword = await hashPassword(newPassword)
    await this.repo.updatePassword(userId, hashedPassword)

    logger.info(`Password changed for user: ${user.email}`)

    return {
      message: 'Password changed successfully',
    }
  }
}
