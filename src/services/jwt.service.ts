import jwt, { SignOptions } from 'jsonwebtoken'
import { IJWTPayload, IPasswordResetTokenPayload } from '@/types/auth'
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, PASSWORD_RESET_TOKEN_EXPIRES_IN } from '@/config/env'
import { createError } from '@/types/errors'
import { IJwtService, ITokenPair } from './interface'

/**
 * JWT Service Implementation
 * Handles JWT token generation and verification using jsonwebtoken library
 */
export class JwtService implements IJwtService {
  private readonly secret: string
  private readonly accessTokenExpiry: string
  private readonly refreshTokenExpiry: string
  private readonly passwordResetExpiry: string
  private readonly issuer: string = 'galley-app'
  private readonly audience: string = 'galley-app-users'

  constructor() {
    this.secret = JWT_SECRET
    this.accessTokenExpiry = JWT_EXPIRES_IN
    this.refreshTokenExpiry = JWT_REFRESH_EXPIRES_IN
    this.passwordResetExpiry = PASSWORD_RESET_TOKEN_EXPIRES_IN
  }

  /**
   * Generate an access token (JWT)
   * @param payload - JWT payload containing userId and email
   * @returns Signed JWT token string
   */
  generateAccessToken(payload: IJWTPayload): string {
    try {
      return jwt.sign(payload, this.secret, {
        expiresIn: this.accessTokenExpiry,
        issuer: this.issuer,
        audience: this.audience,
      } as SignOptions)
    } catch (error) {
      throw new Error('Failed to generate access token')
    }
  }

  /**
   * Generate a refresh token
   * @param payload - JWT payload containing userId and email
   * @returns Signed refresh token string
   */
  generateRefreshToken(payload: IJWTPayload): string {
    try {
      return jwt.sign(payload, this.secret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: this.issuer,
        audience: this.audience,
      } as SignOptions)
    } catch (error) {
      throw new Error('Failed to generate refresh token')
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param payload - JWT payload containing userId and email
   * @returns Object containing accessToken and refreshToken
   */
  generateTokenPair(payload: IJWTPayload): ITokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    }
  }

  /**
   * Generate a password reset token
   * @param payload - Password reset token payload
   * @returns Signed password reset token string
   */
  generatePasswordResetToken(payload: IPasswordResetTokenPayload): string {
    try {
      return jwt.sign(payload, this.secret, {
        expiresIn: this.passwordResetExpiry,
        issuer: this.issuer,
        audience: this.audience,
      } as SignOptions)
    } catch (error) {
      throw new Error('Failed to generate password reset token')
    }
  }

  /**
   * Verify and decode a JWT token
   * @param token - JWT token string to verify
   * @returns Decoded token payload if valid
   * @throws Error if token is invalid, expired, or malformed
   */
  verifyToken<T extends IJWTPayload | IPasswordResetTokenPayload>(token: string): T {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience,
      }) as T

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw createError(401, 'Token has expired')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw createError(401, 'Invalid token')
      }
      if (error instanceof jwt.NotBeforeError) {
        throw createError(401, 'Token not active yet')
      }
      throw createError(401, 'Token verification failed')
    }
  }
}
