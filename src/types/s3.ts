/**
 * S3-related types and interfaces
 */

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean
  error?: string
}

/**
 * S3 upload result
 */
export interface S3UploadResult {
  url: string // Public URL of uploaded file
  key: string // S3 object key
  bucket: string // S3 bucket name
  size: number // File size in bytes
  contentType: string // MIME type
  originalFilename: string // Original filename
}

/**
 * S3 delete result
 */
export interface S3DeleteResult {
  success: boolean
  key: string
  message?: string
}

/**
 * S3 update result (same as upload result with old key)
 */
export interface S3UpdateResult extends S3UploadResult {
  oldKey?: string // Previous S3 key if replaced
}
