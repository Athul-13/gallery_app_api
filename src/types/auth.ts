/**
 * JWT Payload interface
 */
export interface IJWTPayload {
  userId: string
  email: string
}

/**
 * Authentication response (login/register)
 */
export interface IAuthResponse {
  user: {
    id: string
    email: string
    phone: string
  }
  token: string
}

/**
 * Password reset request
 */
export interface IPasswordResetRequest {
  email: string
}

/**
 * Password reset token payload
 */
export interface IPasswordResetTokenPayload {
  userId: string
  email: string
  type: 'password-reset'
}

/**
 * Password reset input
 */
export interface IPasswordResetInput {
  token: string
  newPassword: string
}

/**
 * Express Request with user (for authenticated routes)
 */
export interface IAuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}
