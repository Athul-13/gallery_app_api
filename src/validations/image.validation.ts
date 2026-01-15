import { z } from 'zod'

/**
 * Upload image(s) body validation
 * For single upload: title is optional
 * For bulk upload: titles is optional array
 */
export const uploadImagesSchema = z.object({
  title: z
    .string()
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  titles: z
    .array(z.string().max(200, 'Title cannot exceed 200 characters'))
    .optional(),
})

/**
 * Update image body validation
 * All fields are optional (partial update)
 */
export const updateImageSchema = z.object({
  title: z
    .string()
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  order: z
    .number()
    .int('Order must be an integer')
    .nonnegative('Order must be non-negative')
    .optional(),
})

/**
 * Bulk update order body validation
 * Replaces manual validation in controller
 */
export const bulkUpdateOrderSchema = z.object({
  orders: z
    .array(
      z.object({
        id: z.string().min(1, 'Image ID is required'),
        order: z
          .number()
          .int('Order must be an integer')
          .nonnegative('Order must be non-negative'),
      })
    )
    .min(1, 'Orders array is required and must not be empty'),
})
