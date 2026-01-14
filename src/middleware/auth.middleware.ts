import { Response, NextFunction } from 'express'
import { verifyToken } from '@/utils/jwt'
import { getAccessTokenCookie } from '@/utils/cookie'
import { createError } from '@/types/errors'
import { IAuthenticatedRequest, IJWTPayload } from '@/types/auth'

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (authHeader: string | string[] | undefined): string | null => {
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader
  return header?.startsWith('Bearer ') ? header.substring(7) : null
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * Supports both Bearer token (header) and cookie-based authentication
 */
export const authenticate = (
  req: IAuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization as string | undefined
  const token = extractTokenFromHeader(authHeader) || getAccessTokenCookie(req)

  if (!token) {
    return next(createError(401, 'Authentication required'))
  }

  const payload = verifyToken<IJWTPayload>(token)

  req.user = {
    userId: payload.userId,
    email: payload.email,
  }

  next()
}