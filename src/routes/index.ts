import { Router } from 'express'
import { AuthRoute } from './auth.route'

/**
 * Create and configure routes
 */
export const createRoutes = (): Router => {
  const router = Router()
  const authRoute = new AuthRoute()

  // Mount route modules
  router.use('/auth', authRoute.getRouter())

  return router
}

// Export default routes for backward compatibility
const router = createRoutes()
export { router }
export default router
