import { Response } from 'express'
import { IImageService } from '@/services'
import {
  IUploadImagesRequest,
  IGetImageByIdRequest,
  IGetUserImagesRequest,
} from '@/types'
import { IImageController } from './interface'

/**
 * Image controller
 * Handles HTTP requests for image operations
 */
export class ImageController implements IImageController {
  constructor(private imageService: IImageService) {}

  /**
   * Upload image(s) - handles both single and bulk uploads
   * Detects if single file or multiple files and calls appropriate service method
   */
  uploadImages = async (req: IUploadImagesRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const userId = req.user.userId

    // Extract files from request
    // Multer can attach files as:
    // - req.file (single file)
    // - req.files (array of files or object with fieldname keys)
    let files: Express.Multer.File[] = []

    if (req.file) {
      // Single file upload
      files = [req.file]
    } else if (req.files) {
      // Multiple files upload
      if (Array.isArray(req.files)) {
        files = req.files
      } else {
        // If it's an object, extract all files from all fields
        files = Object.values(req.files).flat()
      }
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      })
    }

    try {
      if (files.length === 1) {
        // Single file upload
        const title = req.body.title || files[0].originalname.replace(/\.[^/.]+$/, '')
        const image = await this.imageService.uploadImage(files[0], userId, title)

        return res.status(201).json({
          success: true,
          data: image,
        })
      } else {
        // Bulk upload
        const titles = req.body.titles
          ? (Array.isArray(req.body.titles) ? req.body.titles : [req.body.titles])
          : undefined

        const result = await this.imageService.uploadBulkImages(files, userId, titles)

        return res.status(201).json({
          success: true,
          data: result,
        })
      }
    } catch (error: any) {
      // Error handling is done by error middleware, but we can add specific handling here if needed
      throw error
    }
  }

  /**
   * Get image by ID
   */
  getImageById = async (req: IGetImageByIdRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const { id } = req.params
    const userId = req.user.userId

    try {
      const image = await this.imageService.getImageById(id, userId)

      return res.status(200).json({
        success: true,
        data: image,
      })
    } catch (error: any) {
      throw error
    }
  }

  /**
   * Get all images for authenticated user
   */
  getUserImages = async (req: IGetUserImagesRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    const userId = req.user.userId
    const page = req.query.page ? parseInt(req.query.page, 10) : undefined
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined

    // Validate pagination params
    if (page !== undefined && (isNaN(page) || page < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number',
      })
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid limit (must be between 1 and 100)',
      })
    }

    try {
      const result = await this.imageService.getUserImages(userId, {
        page,
        limit,
      })

      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error: any) {
      throw error
    }
  }
}
