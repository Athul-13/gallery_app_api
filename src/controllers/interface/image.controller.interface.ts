import { Response } from 'express'
import {
  IUploadImagesRequest,
  IGetImageByIdRequest,
  IGetUserImagesRequest,
  IDeleteImageRequest,
  IUpdateImageRequest,
} from '@/types/image'

/**
 * Image controller interface
 * Defines the contract for image controller operations
 */
export interface IImageController {
  /**
   * Upload image(s) - handles both single and bulk uploads
   */
  uploadImages(req: IUploadImagesRequest, res: Response): Promise<Response | void>

  /**
   * Get image by ID
   */
  getImageById(req: IGetImageByIdRequest, res: Response): Promise<Response | void>

  /**
   * Get all images for authenticated user
   */
  getUserImages(req: IGetUserImagesRequest, res: Response): Promise<Response | void>

  /**
   * Delete an image by ID
   */
  deleteImage(req: IDeleteImageRequest, res: Response): Promise<Response | void>

  /**
   * Update an image by ID
   */
  updateImage(req: IUpdateImageRequest, res: Response): Promise<Response | void>
}
