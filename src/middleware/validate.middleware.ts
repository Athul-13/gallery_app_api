import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { logger } from '@/config/logger'
import { createError } from '@/types/errors'

/**
 * Validation middleware using Zod schemas
 * Validates request data and attaches validated data to request
 */
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = await schema.parseAsync(req[source])
      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error:', {
          errors: error.issues,
          path: req.path,
          source,
        })

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }

      logger.error('Unexpected validation error:', error)
      return next(createError(500, 'Validation error occurred'))
    }
  }
}

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body')

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query')

/**
 * Validate request route parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params')
