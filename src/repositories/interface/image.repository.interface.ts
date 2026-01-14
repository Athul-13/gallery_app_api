import { IImage, ICreateImage } from '@/types/image'

/**
 * Image repository interface
 * Defines the contract for image data access operations
 */
export interface IImageRepository {
  /**
   * Find image by ID
   * @param id - Image ID
   * @returns Image document or null if not found
   */
  findById(id: string): Promise<IImage | null>

  /**
   * Find all images by owner ID with pagination
   * @param ownerId - Owner user ID
   * @param options - Pagination options
   * @returns Object with images array and total count
   */
  findByOwnerId(
    ownerId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ images: IImage[]; total: number }>

  /**
   * Find multiple images by IDs
   * @param ids - Array of image IDs
   * @returns Array of image documents
   */
  findByIds(ids: string[]): Promise<IImage[]>

  /**
   * Create a new image
   * @param imageData - Image creation data
   * @returns Created image document
   */
  create(imageData: ICreateImage): Promise<IImage>
}
