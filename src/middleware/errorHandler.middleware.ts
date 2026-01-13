import { Request, Response, NextFunction } from 'express'
import { logger } from '@/config/logger'
import { NODE_ENV } from '@/config/env'

/**
 * Helper to create error response
 */
const errorResponse = (message: string, stack?: string) => ({
  success: false,
  message,
  ...(NODE_ENV === 'development' && stack && { stack }),
})

/**
 * Centralized error handling middleware
 * Must be the last middleware in the chain
 * Works with express-async-errors to catch async errors
 */
export const errorHandler = (
  err: Error & { statusCode?: number; code?: number; keyPattern?: Record<string, unknown>; errors?: Record<string, { path: string; message: string }> },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  // Handle HTTP errors (from createError or http-errors)
  if (err.statusCode) {
    return res.status(err.statusCode).json(errorResponse(err.message, err.stack))
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    })
  }

  // Handle Mongoose duplicate key errors
  if ((err.name === 'MongoServerError' || err.name === 'MongoError') && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0]
    return res.status(409).json(errorResponse(`${field} already exists`))
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token'))
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token has expired'))
  }

  // Handle CastError (invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(errorResponse('Invalid ID format'))
  }

  // Default: 500 Internal Server Error
  return res.status(500).json(
    errorResponse(
      NODE_ENV === 'production' ? 'Internal server error' : err.message,
      err.stack
    )
  )
}

/**
 * 404 Not Found handler
 * Must be placed after all routes but before error handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
}
