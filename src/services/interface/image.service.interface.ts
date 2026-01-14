import { IImageResponse, IBulkImageResponse } from '@/types/image'

/**
 * Image service interface
 * Defines the contract for image operations
 */
export interface IImageService {
  /**
   * Upload single image
   * @param file - File from multer
   * @param userId - Owner user ID
   * @param title - Image title
   * @returns Image response
   */
  uploadImage(file: Express.Multer.File, userId: string, title: string): Promise<IImageResponse>

  /**
   * Upload multiple images
   * @param files - Array of files from multer
   * @param userId - Owner user ID
   * @param titles - Optional array of titles (defaults to filenames)
   * @returns Bulk image response
   */
  uploadBulkImages(
    files: Express.Multer.File[],
    userId: string,
    titles?: string[]
  ): Promise<IBulkImageResponse>

  /**
   * Get image by ID (with ownership check)
   * @param imageId - Image ID
   * @param userId - User ID for ownership verification
   * @returns Image response
   */
  getImageById(imageId: string, userId: string): Promise<IImageResponse>

  /**
   * Get all images for a user
   * @param userId - User ID
   * @param options - Pagination options
   * @returns Paginated image response
   */
  getUserImages(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ images: IImageResponse[]; total: number; page: number; limit: number }>
}
