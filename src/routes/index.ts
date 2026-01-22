import { Router } from 'express'
import { AuthRoute } from './auth.route'
import { ImageRoute } from './image.route'
import { getAuthController, getImageController } from '@/container'

/**
 * Create and configure routes
 * Uses DI container to resolve dependencies
 */
export const createRoutes = (): Router => {
  const router = Router()
  
  const authController = getAuthController()
  const authRoute = new AuthRoute(authController)

  const imageController = getImageController()
  const imageRoute = new ImageRoute(imageController)

  // Mount route modules
  router.use('/auth', authRoute.getRouter())
  router.use('/images', imageRoute.getRouter())

  return router
}

// Export default routes for backward compatibility
const router = createRoutes()
export { router }
export default router
