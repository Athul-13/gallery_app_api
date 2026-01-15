import { IImageController } from '@/controllers/interface'
import { Router } from 'express'
import { authenticate, validateBody } from '@/middleware'
import { IRoutes } from './interface'
import { uploadAny } from '@/middleware/upload.middleware'
import {
  uploadImagesSchema,
  updateImageSchema,
  bulkUpdateOrderSchema,
} from '@/validations/image.validation'

/**
 * Image routes
 * Handles all image-related endpoints
 */
export class ImageRoute implements IRoutes {
  constructor(private imageController: IImageController) {}

  getRouter(): Router {
    const router = Router()

    // All image routes require authentication
    router.use(authenticate)

    // Upload image(s) - handles both single and bulk uploads
    router.post(
      '/upload',
      uploadAny,
      validateBody(uploadImagesSchema),
      this.imageController.uploadImages
    )

    // Get all images for authenticated user
    router.get('/get', this.imageController.getUserImages)

    // Delete image by ID (must come before GET /:id to avoid route conflicts)
    router.delete('/:id/delete', this.imageController.deleteImage)

    // Update image by ID (must come before GET /:id to avoid route conflicts)
    // Accepts optional file upload for replacing the image
    router.put(
      '/:id/update',
      uploadAny,
      validateBody(updateImageSchema),
      this.imageController.updateImage
    )

    // Bulk update order for multiple images
    router.put(
      '/bulk-update-order',
      validateBody(bulkUpdateOrderSchema),
      this.imageController.bulkUpdateOrder
    )

    // Get image by ID (must be last to avoid conflicts with other routes)
    router.get('/:id', this.imageController.getImageById)

    return router
  }
}
