import createError from 'http-errors'

/**
 * Custom application error class
 * Use this for application-specific errors
 */
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Re-export createError from http-errors
 * Use this for standard HTTP errors
 */
export { createError }

