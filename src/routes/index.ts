import { Router } from 'express'
import { AuthRoute } from './auth.route'
import { getAuthController } from '@/container'

/**
 * Create and configure routes
 * Uses DI container to resolve dependencies
 */
export const createRoutes = (): Router => {
  const router = Router()
  
  const authController = getAuthController()
  const authRoute = new AuthRoute(authController)

  // Mount route modules
  router.use('/auth', authRoute.getRouter())

  return router
}

// Export default routes for backward compatibility
const router = createRoutes()
export { router }
export default router
