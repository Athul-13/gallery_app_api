import {
  IImage,
  ICreateImage,
  IImageResponse,
  IBulkImageResponse,
  createError,
} from '@/types'
import { IImageRepository } from '@/repositories/interface'
import {
  uploadImageToS3,
  uploadMultipleImagesToS3,
} from '@/utils/s3'
import { logger } from '@/config/logger'
import { IImageService } from './interface'

/**
 * Image service
 * Handles image upload, retrieval, and business logic
 */
export class ImageService implements IImageService {
  constructor(private imageRepo: IImageRepository) {}

  /**
   * Format image document to response format
   */
  private formatImageResponse(image: IImage): IImageResponse {
    return {
      id: image._id.toString(),
      title: image.title,
      url: image.url,
      order: image.order,
      ownerId: image.ownerId.toString(),
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    }
  }

  /**
   * Upload single image
   * @param file - File from multer
   * @param userId - Owner user ID
   * @param title - Image title
   * @returns Image response
   */
  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    title: string
  ): Promise<IImageResponse> {
    try {
      // 1. Upload to S3
      const s3Result = await uploadImageToS3(file, userId, title)

      // 2. Save to database
      const image = await this.imageRepo.create({
        title,
        url: s3Result.url,
        ownerId: userId,
      })

      logger.info('Image uploaded', {
        imageId: image._id.toString(),
        userId,
      })

      // 3. Format and return response
      return this.formatImageResponse(image)
    } catch (error: any) {
      logger.error('Failed to upload image', { error, userId })
      throw error // Re-throw to preserve error status codes
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of files from multer
   * @param userId - Owner user ID
   * @param titles - Optional array of titles (defaults to filenames)
   * @returns Bulk image response
   */
  async uploadBulkImages(
    files: Express.Multer.File[],
    userId: string,
    titles?: string[]
  ): Promise<IBulkImageResponse> {
    try {
      // 1. Upload all to S3 (parallel)
      const s3Results = await uploadMultipleImagesToS3(files, userId)

      // 2. Prepare data for database
      const imagesData: ICreateImage[] = s3Results.map((result, index) => {
        // Extract filename without extension for title
        const originalFilename = files[index].originalname
        const filenameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '')
        const title = titles?.[index] || filenameWithoutExt

        return {
          title,
          url: result.url,
          ownerId: userId,
        }
      })

      // 3. Save to database (create all in parallel)
      const images = await Promise.all(
        imagesData.map((data) => this.imageRepo.create(data))
      )

      logger.info('Bulk images uploaded', {
        count: images.length,
        userId,
      })

      // 4. Format and return responses
      return {
        images: images.map((img) => this.formatImageResponse(img)),
        total: images.length,
      }
    } catch (error: any) {
      logger.error('Failed to upload bulk images', { error, userId })
      throw error
    }
  }

  /**
   * Get image by ID (with ownership check)
   * @param imageId - Image ID
   * @param userId - User ID for ownership verification
   * @returns Image response
   */
  async getImageById(imageId: string, userId: string): Promise<IImageResponse> {
    const image = await this.imageRepo.findById(imageId)

    if (!image) {
      throw createError(404, 'Image not found')
    }

    // Check ownership
    if (image.ownerId.toString() !== userId) {
      throw createError(403, 'You do not have permission to access this image')
    }

    return this.formatImageResponse(image)
  }

  /**
   * Get all images for a user
   * @param userId - User ID
   * @param options - Pagination options
   * @returns Paginated image response
   */
  async getUserImages(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{
    images: IImageResponse[]
    total: number
    page: number
    limit: number
  }> {
    const page = options?.page || 1
    const limit = options?.limit || 50

    const result = await this.imageRepo.findByOwnerId(userId, { page, limit })

    return {
      images: result.images.map((img) => this.formatImageResponse(img)),
      total: result.total,
      page,
      limit,
    }
  }
}
