import {
  IImage,
  ICreateImage,
  IImageResponse,
  IBulkImageResponse,
  createError,
  IUpdateImage,
} from '@/types'
import { IImageRepository } from '@/repositories/interface'
import {
  deleteImageFromS3,
  uploadImageToS3,
  uploadMultipleImagesToS3,
  updateImageInS3,
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

  /**
   * Delete an image by ID
   * @param imageId - Image ID
   * @param userId - User ID for ownership verification
   * @returns void
   */
  async deleteImage(imageId: string, userId: string): Promise<void> {
    // 1. Find image and verify ownership
    const image = await this.imageRepo.findById(imageId)
    if (!image) {
      throw createError(404, 'Image not found')
    }

    // Check ownership
    if (image.ownerId.toString() !== userId) {
      throw createError(403, 'You do not have permission to delete this image')
    }

    try {
      // 2. Delete from S3 first (if this fails, we don't delete from DB)
      await deleteImageFromS3(image.url)

      // 3. Delete from database
      await this.imageRepo.delete(imageId)

      logger.info('Image deleted', {
        imageId: image._id.toString(),
        userId,
      })
    } catch (error: any) {
      logger.error('Failed to delete image', {
        imageId: image._id.toString(),
        userId,
        error,
      })
      throw error // Re-throw to preserve error status codes
    }
  }

  /**
   * Update an image by ID
   * @param imageId - Image ID
   * @param userId - User ID for ownership verification
   * @param imageData - Image update data (title, order, etc.)
   * @param file - Optional file to replace the image
   * @returns Updated image response
   */
  async updateImage(
    imageId: string,
    userId: string,
    imageData: IUpdateImage,
    file?: Express.Multer.File
  ): Promise<IImageResponse> {
    // 1. Find image and verify ownership
    const existingImage = await this.imageRepo.findById(imageId)
    if (!existingImage) {
      throw createError(404, 'Image not found')
    }

    // Check ownership
    if (existingImage.ownerId.toString() !== userId) {
      throw createError(403, 'You do not have permission to update this image')
    }

    try {
      // 2. If file is provided, update image in S3 (upload new, delete old)
      if (file) {
        const s3Result = await updateImageInS3(
          file,
          userId,
          existingImage.url,
          imageData.title
        )

        // Update URL with new S3 URL
        imageData.url = s3Result.url

        logger.info('Image file updated in S3', {
          imageId: existingImage._id.toString(),
          userId,
          oldKey: s3Result.oldKey,
          newKey: s3Result.key,
        })
      }

      // 3. Update in database (metadata: title, order, and URL if file was uploaded)
      const updatedImage = await this.imageRepo.update(imageId, imageData)

      // Handle case where image was deleted between existence check and update
      if (!updatedImage) {
        throw createError(404, 'Image not found')
      }

      logger.info('Image updated', {
        imageId: existingImage._id.toString(),
        userId,
        updatedFields: Object.keys(imageData),
        fileReplaced: !!file,
      })

      return this.formatImageResponse(updatedImage)
    } catch (error: any) {
      logger.error('Failed to update image', {
        imageId: existingImage._id.toString(),
        userId,
        error,
      })
      throw error // Re-throw to preserve error status codes
    }
  }
}
