import { Response } from 'express'
import { AuthService, PasswordService } from '@/services'
import {
  ICreateUser,
  ILoginCredentials,
  IPasswordResetRequest,
  IPasswordResetInput,
  IChangePasswordInput,
  IAuthenticatedRequest,
} from '@/types'

export class AuthController {
  constructor(
    private authService: AuthService = authService,
    private passwordService: PasswordService = passwordService
  ) {}

  async register(req: { body: ICreateUser }, res: Response) {
    const user = await this.authService.registerUser(req.body)
    res.status(201).json(user)
  }

  async login(req: { body: ILoginCredentials }, res: Response) {
    const result = await this.authService.loginUser(req.body)
    res.status(200).json(result)
  }

  async refreshToken(req: { body: { refreshToken: string } }, res: Response) {
    const result = await this.authService.refreshAccessToken(req.body.refreshToken)
    res.status(200).json(result)
  }

  async changePassword(req: IAuthenticatedRequest & { body: IChangePasswordInput }, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }
    const result = await this.passwordService.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword
    )
    return res.status(200).json(result)
  }

  async requestPasswordReset(req: { body: IPasswordResetRequest }, res: Response) {
    const result = await this.passwordService.requestPasswordReset(req.body.email)
    res.status(200).json(result)
  }

  async resetPassword(req: { body: IPasswordResetInput }, res: Response) {
    const result = await this.passwordService.resetPassword(req.body)
    res.status(200).json(result)
  }
}