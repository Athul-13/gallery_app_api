import { IPasswordResetInput } from '@/types'

/**
 * Password reset request response
 */
export interface IPasswordResetRequestResponse {
  message: string
  resetToken?: string
}

/**
 * Password change response
 */
export interface IPasswordChangeResponse {
  message: string
}

/**
 * Password service interface
 * Defines the contract for password operations
 */
export interface IPasswordService {
  requestPasswordReset(email: string): Promise<IPasswordResetRequestResponse>
  resetPassword(resetData: IPasswordResetInput): Promise<IPasswordChangeResponse>
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<IPasswordChangeResponse>
}
