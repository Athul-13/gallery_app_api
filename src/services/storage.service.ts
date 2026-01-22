import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_S3_BUCKET_URL,
  AWS_MAX_FILE_SIZE,
  AWS_ALLOWED_MIME_TYPES,
} from '@/config/env'
import { logger } from '@/config/logger'
import { createError } from '@/types/errors'
import {
  FileValidationResult,
  S3UploadResult,
  S3DeleteResult,
  S3UpdateResult,
} from '@/types/s3'
import { IStorageService } from './interface'

/**
 * S3 Storage Service Implementation
 * Handles file storage operations using AWS S3
 */
export class StorageService implements IStorageService {
  private readonly s3Client: S3Client
  private readonly bucketName: string
  private readonly region: string
  private readonly bucketUrl: string | null
  private readonly maxFileSize: number
  private readonly allowedMimeTypes: string[]

  constructor() {
    this.bucketName = AWS_S3_BUCKET_NAME
    this.region = AWS_REGION
    this.bucketUrl = AWS_S3_BUCKET_URL || null
    this.maxFileSize = parseInt(AWS_MAX_FILE_SIZE, 10)
    this.allowedMimeTypes = AWS_ALLOWED_MIME_TYPES.split(',').map((t) => t.trim())

    // Initialize S3 client
    this.s3Client = new S3Client({
      region: this.region,
      ...(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
        ? {
            credentials: {
              accessKeyId: AWS_ACCESS_KEY_ID,
              secretAccessKey: AWS_SECRET_ACCESS_KEY,
            },
          }
        : {}),
    })
  }

  /**
   * Validate image file before upload
   * @param file - File from multer
   * @param maxSize - Maximum file size in bytes (optional, defaults to env)
   * @param allowedTypes - Allowed MIME types array (optional, defaults to env)
   * @returns Validation result
   */
  validateImageFile(
    file: Express.Multer.File,
    maxSize?: number,
    allowedTypes?: string[]
  ): FileValidationResult {
    // Check if file exists
    if (!file || !file.buffer) {
      return {
        isValid: false,
        error: 'File is required',
      }
    }

    // Check if buffer is empty
    if (file.buffer.length === 0) {
      return {
        isValid: false,
        error: 'File is empty',
      }
    }

    // Get max size from parameter or env
    const maxSizeBytes = maxSize || this.maxFileSize
    const maxSizeMB = maxSizeBytes / (1024 * 1024)

    // Check file size
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${maxSizeMB.toFixed(2)}MB`,
      }
    }

    // Get allowed types from parameter or env
    const allowedMimeTypes = allowedTypes || this.allowedMimeTypes

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      }
    }

    return {
      isValid: true,
    }
  }

  /**
   * Sanitize filename for S3 key
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    // Extract extension
    const lastDotIndex = filename.lastIndexOf('.')
    const extension = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : ''
    const nameWithoutExt = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename

    // Remove special characters, keep alphanumeric, hyphens, underscores
    let sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, '-') // Replace special chars with hyphen
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .toLowerCase()

    // Limit length (keep extension space)
    const maxLength = 100 - extension.length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized + extension
  }

  /**
   * Generate unique S3 key for image
   * @param userId - User ID
   * @param filename - Original filename
   * @param timestamp - Optional timestamp (defaults to Date.now())
   * @returns S3 object key
   */
  private generateS3Key(userId: string, filename: string, timestamp?: number): string {
    const ts = timestamp || Date.now()
    const uuid = uuidv4()
    const sanitizedFilename = this.sanitizeFilename(filename)
    return `images/${userId}/${ts}-${uuid}-${sanitizedFilename}`
  }

  /**
   * Construct public S3 URL from key
   * @param key - S3 object key
   * @returns Public S3 URL
   */
  private constructS3Url(key: string): string {
    // If custom bucket URL is provided, use it
    if (this.bucketUrl) {
      return `${this.bucketUrl.replace(/\/$/, '')}/${key}`
    }

    // Construct standard S3 URL
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
  }

  /**
   * Extract S3 key from full URL
   * @param url - Full S3 URL
   * @returns S3 key or null if URL format is unrecognized
   */
  private extractS3KeyFromUrl(url: string): string | null {
    try {
      // Handle standard S3 URLs: https://bucket.s3.region.amazonaws.com/key
      const s3Pattern = /https?:\/\/[^\/]+\/(.+)$/
      const match = url.match(s3Pattern)
      if (match && match[1]) {
        return decodeURIComponent(match[1])
      }

      // Handle CloudFront or custom domain URLs
      const urlObj = new URL(url)
      const path = urlObj.pathname
      if (path && path.startsWith('/')) {
        return path.substring(1) // Remove leading slash
      }

      return null
    } catch (error) {
      logger.warn('Failed to extract S3 key from URL', { url, error })
      return null
    }
  }

  /**
   * Upload single image file to S3
   * @param file - File from multer
   * @param userId - Owner user ID
   * @param title - Optional title (used for filename if provided)
   * @returns S3 upload result with public URL
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    title?: string
  ): Promise<S3UploadResult> {
    // Validate file
    const validation = this.validateImageFile(file)
    if (!validation.isValid) {
      throw createError(400, validation.error || 'Invalid file')
    }

    try {
      // Generate S3 key
      const filename = title
        ? `${title}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`
        : file.originalname
      const key = this.generateS3Key(userId, filename)

      // Prepare upload command
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          userId,
          originalFilename: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      })

      // Upload to S3
      await this.s3Client.send(command)

      // Construct public URL
      const url = this.constructS3Url(key)

      logger.info('Image uploaded to S3', {
        key,
        userId,
        size: file.size,
        contentType: file.mimetype,
      })

      return {
        url,
        key,
        bucket: this.bucketName,
        size: file.size,
        contentType: file.mimetype,
        originalFilename: file.originalname,
      }
    } catch (error) {
      logger.error('Failed to upload image to S3', {
        error,
        userId,
        filename: file.originalname,
      })
      throw createError(500, 'Failed to upload image to S3')
    }
  }

  /**
   * Upload multiple images to S3 in parallel
   * @param files - Array of files from multer
   * @param userId - Owner user ID
   * @returns Array of S3 upload results
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    userId: string
  ): Promise<S3UploadResult[]> {
    // Validate all files first (fail fast)
    files.forEach((file, index) => {
      const validation = this.validateImageFile(file)
      if (!validation.isValid) {
        throw createError(
          400,
          `Invalid file at index ${index}: ${file.originalname} - ${validation.error}`
        )
      }
    })

    try {
      // Upload all files in parallel using Promise.all
      const uploadPromises = files.map((file) => this.uploadImage(file, userId))
      const results = await Promise.all(uploadPromises)

      logger.info('Multiple images uploaded to S3', {
        count: results.length,
        userId,
      })

      return results
    } catch (error) {
      logger.error('Failed to upload multiple images to S3', {
        error,
        userId,
        fileCount: files.length,
      })
      throw error // Re-throw to preserve original error
    }
  }

  /**
   * Delete image from S3
   * @param s3KeyOrUrl - S3 key or full URL
   * @returns Delete result
   */
  async deleteImage(s3KeyOrUrl: string): Promise<S3DeleteResult> {
    try {
      // Extract key from URL if URL provided
      let key = s3KeyOrUrl
      if (s3KeyOrUrl.startsWith('http://') || s3KeyOrUrl.startsWith('https://')) {
        const extractedKey = this.extractS3KeyFromUrl(s3KeyOrUrl)
        if (!extractedKey) {
          throw createError(400, 'Invalid S3 URL format')
        }
        key = extractedKey
      }

      // Validate key format (should start with images/)
      if (!key.startsWith('images/')) {
        logger.warn('S3 key does not start with images/', { key })
        // Don't throw, just log warning - might be valid
      }

      // Prepare delete command
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      // Delete from S3
      await this.s3Client.send(command)

      logger.info('Image deleted from S3', { key })

      return {
        success: true,
        key,
        message: 'Image deleted successfully',
      }
    } catch (error: any) {
      // Handle "NoSuchKey" error (file doesn't exist) - return success (idempotent)
      if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
        logger.warn('Image not found in S3 (already deleted)', { s3KeyOrUrl })
        return {
          success: true,
          key: s3KeyOrUrl,
          message: 'Image not found (may already be deleted)',
        }
      }

      logger.error('Failed to delete image from S3', {
        error,
        s3KeyOrUrl,
      })

      // Handle permission errors
      if (error.name === 'AccessDenied' || error.Code === 'AccessDenied') {
        throw createError(403, 'Permission denied to delete image')
      }

      throw createError(500, 'Failed to delete image from S3')
    }
  }

  /**
   * Update image in S3 (delete old, upload new)
   * @param file - New file to upload
   * @param userId - Owner user ID
   * @param oldS3KeyOrUrl - Old S3 key or URL to delete
   * @param title - Optional title for new file
   * @returns Update result with new URL and old key
   */
  async updateImage(
    file: Express.Multer.File,
    userId: string,
    oldS3KeyOrUrl: string,
    title?: string
  ): Promise<S3UpdateResult> {
    // Validate new file
    const validation = this.validateImageFile(file)
    if (!validation.isValid) {
      throw createError(400, validation.error || 'Invalid file')
    }

    try {
      // Extract old key from URL if needed
      let oldKey = oldS3KeyOrUrl
      if (oldS3KeyOrUrl.startsWith('http://') || oldS3KeyOrUrl.startsWith('https://')) {
        const extractedKey = this.extractS3KeyFromUrl(oldS3KeyOrUrl)
        if (!extractedKey) {
          throw createError(400, 'Invalid old S3 URL format')
        }
        oldKey = extractedKey
      }

      // Upload new file first
      const uploadResult = await this.uploadImage(file, userId, title)

      // Try to delete old file (don't fail if this fails - new file is already uploaded)
      try {
        await this.deleteImage(oldKey)
      } catch (deleteError) {
        logger.warn('Failed to delete old image after upload', {
          oldKey,
          newKey: uploadResult.key,
          error: deleteError,
        })
        // Continue - new file is already uploaded
      }

      logger.info('Image updated in S3', {
        oldKey,
        newKey: uploadResult.key,
        userId,
      })

      return {
        ...uploadResult,
        oldKey,
      }
    } catch (error) {
      logger.error('Failed to update image in S3', {
        error,
        userId,
        oldS3KeyOrUrl,
      })
      throw error // Re-throw to preserve original error
    }
  }
}
