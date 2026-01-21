import {
  FileValidationResult,
  S3UploadResult,
  S3DeleteResult,
  S3UpdateResult,
} from '@/types/s3'

/**
 * Storage Service Interface
 * Defines the contract for file storage operations
 * This abstraction allows for easy testing and swapping implementations (S3, Azure Blob, local storage, etc.)
 */
export interface IStorageService {
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
  ): FileValidationResult

  /**
   * Upload single image file to storage
   * @param file - File from multer
   * @param userId - Owner user ID
   * @param title - Optional title (used for filename if provided)
   * @returns Upload result with public URL
   */
  uploadImage(
    file: Express.Multer.File,
    userId: string,
    title?: string
  ): Promise<S3UploadResult>

  /**
   * Upload multiple images to storage in parallel
   * @param files - Array of files from multer
   * @param userId - Owner user ID
   * @returns Array of upload results
   */
  uploadMultipleImages(
    files: Express.Multer.File[],
    userId: string
  ): Promise<S3UploadResult[]>

  /**
   * Delete image from storage
   * @param s3KeyOrUrl - Storage key or full URL
   * @returns Delete result
   */
  deleteImage(s3KeyOrUrl: string): Promise<S3DeleteResult>

  /**
   * Update image in storage (delete old, upload new)
   * @param file - New file to upload
   * @param userId - Owner user ID
   * @param oldS3KeyOrUrl - Old storage key or URL to delete
   * @param title - Optional title for new file
   * @returns Update result with new URL and old key
   */
  updateImage(
    file: Express.Multer.File,
    userId: string,
    oldS3KeyOrUrl: string,
    title?: string
  ): Promise<S3UpdateResult>
}
