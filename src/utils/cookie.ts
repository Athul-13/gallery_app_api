import { Response, Request } from 'express'
import { NODE_ENV } from '@/config/env'

/**
 * Cookie utility functions for JWT token management
 */

/**
 * Cookie configuration options
 */
const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access (XSS protection)
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  path: '/', // Available site-wide
}

/**
 * Set access token in HTTP-only cookie
 * @param res - Express response object
 * @param token - JWT access token
 * @param maxAge - Cookie expiration in seconds (default: 7 days)
 */
export const setAccessTokenCookie = (
  res: Response,
  token: string,
  maxAge: number = 7 * 24 * 60 * 60 // 7 days in seconds
): void => {
  res.cookie('accessToken', token, {
    ...cookieOptions,
    maxAge: maxAge * 1000, // Convert to milliseconds
  })
}

/**
 * Set refresh token in HTTP-only cookie
 * @param res - Express response object
 * @param token - JWT refresh token
 * @param maxAge - Cookie expiration in seconds (default: 30 days)
 */
export const setRefreshTokenCookie = (
  res: Response,
  token: string,
  maxAge: number = 30 * 24 * 60 * 60 // 30 days in seconds
): void => {
  res.cookie('refreshToken', token, {
    ...cookieOptions,
    maxAge: maxAge * 1000, // Convert to milliseconds
  })
}

/**
 * Get access token from cookie
 * @param req - Express request object
 * @returns Access token string or null if not found
 */
export const getAccessTokenCookie = (req: Request): string | null => {
  return req.cookies?.accessToken || null
}

/**
 * Get refresh token from cookie
 * @param req - Express request object
 * @returns Refresh token string or null if not found
 */
export const getRefreshTokenCookie = (req: Request): string | null => {
  return req.cookies?.refreshToken || null
}

/**
 * Clear access token cookie
 * @param res - Express response object
 */
export const clearAccessTokenCookie = (res: Response): void => {
  res.clearCookie('accessToken', cookieOptions)
}

/**
 * Clear refresh token cookie
 * @param res - Express response object
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', cookieOptions)
}

/**
 * Clear all authentication cookies
 * @param res - Express response object
 */
export const clearAuthCookies = (res: Response): void => {
  clearAccessTokenCookie(res)
  clearRefreshTokenCookie(res)
}
