import { IImageController } from '@/controllers/interface'
import { Router } from 'express'
import { authenticate } from '@/middleware'
import { IRoutes } from './interface'
import { uploadAny } from '@/middleware/upload.middleware'

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
    // Uses uploadAny middleware to accept files from any field name
    router.post('/upload', uploadAny, this.imageController.uploadImages)

    // Get all images for authenticated user
    router.get('/get', this.imageController.getUserImages)

    // Get image by ID
    router.get('/:id', this.imageController.getImageById)

    return router
  }
}
