import { IAuthController } from "@/controllers"
import { Router } from "express"
import { authenticate, validateBody } from "@/middleware"
import { IRoutes } from "./interface"
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/validations/auth.validation"

export class AuthRoute implements IRoutes {
  constructor(
    private authController: IAuthController = authController,
  ) {}

  getRouter(): Router {
    const router = Router()
    
    router.post('/register', validateBody(registerSchema), this.authController.register)
    
    router.post('/login', validateBody(loginSchema), this.authController.login)
    
    router.post('/refresh-token', this.authController.refreshToken)
    
    router.post('/logout', this.authController.logout)
    
    router.post('/change-password', authenticate, validateBody(changePasswordSchema), this.authController.changePassword)
    
    router.post('/request-password-reset', validateBody(requestPasswordResetSchema), this.authController.requestPasswordReset)
    
    router.post('/reset-password', validateBody(resetPasswordSchema), this.authController.resetPassword)
    
    return router
  }
}