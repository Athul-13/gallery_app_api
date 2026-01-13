import jwt, { SignOptions } from 'jsonwebtoken'
import { IJWTPayload, IPasswordResetTokenPayload } from '@/types/auth'
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, PASSWORD_RESET_TOKEN_EXPIRES_IN } from '@/config/env'

/**
 * JWT utility functions for token generation, verification, and decoding
 */

/**
 * Generate an access token (JWT)
 * @param payload - JWT payload containing userId and email
 * @returns Signed JWT token string
 */
export const generateAccessToken = (payload: IJWTPayload): string => {
  try {
    return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'galley-app',
        audience: 'galley-app-users',
      } as SignOptions
    )
  } catch (error) {
    throw new Error('Failed to generate access token')
  }
}

/**
 * Generate a refresh token
 * @param payload - JWT payload containing userId and email
 * @returns Signed refresh token string
 */
export const generateRefreshToken = (payload: IJWTPayload): string => {
  try {
    return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'galley-app',
        audience: 'galley-app-users',
      } as SignOptions
    )
  } catch (error) {
    throw new Error('Failed to generate refresh token')
  }
}

/**
 * Generate both access and refresh tokens
 * @param payload - JWT payload containing userId and email
 * @returns Object containing accessToken and refreshToken
 */
export const generateTokenPair = (payload: IJWTPayload): {
  accessToken: string
  refreshToken: string
} => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

/**
 * Generate a password reset token
 * @param payload - Password reset token payload
 * @returns Signed password reset token string
 */
export const generatePasswordResetToken = (payload: IPasswordResetTokenPayload): string => {
  try {
    return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN,
        issuer: 'galley-app',
        audience: 'galley-app-users',
      } as SignOptions
    )
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
export const verifyToken = <T extends IJWTPayload | IPasswordResetTokenPayload>(
  token: string
): T => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'galley-app',
      audience: 'galley-app-users',
    }) as T

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active yet')
    }
    throw new Error('Token verification failed')
  }
}
