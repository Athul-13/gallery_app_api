import multer from 'multer'
import { Request } from 'express'
import { createError } from '@/types/errors'
import { AWS_MAX_FILE_SIZE, AWS_ALLOWED_MIME_TYPES } from '@/config/env'

/**
 * Configure multer storage (memory storage for S3 uploads)
 */
const storage = multer.memoryStorage()

/**
 * File filter function
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = AWS_ALLOWED_MIME_TYPES.split(',').map((t) => t.trim())

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      createError(
        400,
        `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      ) as any
    )
  }
}

/**
 * Multer configuration
 */
const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(AWS_MAX_FILE_SIZE, 10), // Max file size in bytes
    files: 10, // Max number of files (for bulk upload)
  },
}

/**
 * Single file upload middleware
 */
export const uploadSingle = multer(multerConfig).single('image')

/**
 * Multiple files upload middleware
 */
export const uploadMultiple = multer(multerConfig).array('images', 10)

/**
 * Flexible upload middleware - handles both single and multiple files
 * Uses 'any' field name to accept files from any field
 */
export const uploadAny = multer(multerConfig).any()
