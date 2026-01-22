import { IJWTPayload, IPasswordResetTokenPayload } from '@/types/auth'

/**
 * Token pair response
 */
export interface ITokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * JWT Service Interface
 * Defines the contract for JWT token operations
 * This abstraction allows for easy testing and swapping implementations
 */
export interface IJwtService {
  /**
   * Generate an access token
   * @param payload - JWT payload containing userId and email
   * @returns Signed JWT token string
   */
  generateAccessToken(payload: IJWTPayload): string

  /**
   * Generate a refresh token
   * @param payload - JWT payload containing userId and email
   * @returns Signed refresh token string
   */
  generateRefreshToken(payload: IJWTPayload): string

  /**
   * Generate both access and refresh tokens
   * @param payload - JWT payload containing userId and email
   * @returns Object containing accessToken and refreshToken
   */
  generateTokenPair(payload: IJWTPayload): ITokenPair

  /**
   * Generate a password reset token
   * @param payload - Password reset token payload
   * @returns Signed password reset token string
   */
  generatePasswordResetToken(payload: IPasswordResetTokenPayload): string

  /**
   * Verify and decode a JWT token
   * @param token - JWT token string to verify
   * @returns Decoded token payload if valid
   * @throws Error if token is invalid, expired, or malformed
   */
  verifyToken<T extends IJWTPayload | IPasswordResetTokenPayload>(token: string): T
}
