import { Request, Response } from 'express'
import { IAuthService, IPasswordService } from '@/services'
import {
  ICreateUser,
  ILoginCredentials,
  IPasswordResetRequest,
  IPasswordResetInput,
  IChangePasswordInput,
  IAuthenticatedRequest,
} from '@/types'
import { IAuthController } from './interface'
import { setAccessTokenCookie, setRefreshTokenCookie, getRefreshTokenCookie, clearAuthCookies } from '@/utils/cookie'

export class AuthController implements IAuthController {
  constructor(
    private authService: IAuthService,
    private passwordService: IPasswordService
  ) {}

  register = async (req: { body: ICreateUser }, res: Response) => {
    const user = await this.authService.registerUser(req.body)
    res.status(201).json(user)
  };

  login = async (req: { body: ILoginCredentials }, res: Response) => {
    const result = await this.authService.loginUser(req.body)
    
    setAccessTokenCookie(res, result.tokens.accessToken)
    setRefreshTokenCookie(res, result.tokens.refreshToken)
    
    res.status(200).json({
      user: result.user,
    })
  };

  refreshToken = async (req: Request & { body: { refreshToken?: string } }, res: Response) => {
    const refreshToken = req.body.refreshToken || getRefreshTokenCookie(req)
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' })
    }
    
    const result = await this.authService.refreshAccessToken(refreshToken)
    
    setAccessTokenCookie(res, result.accessToken)
    
    return res.status(200).json({
      user: result.user,
    })
  };

  changePassword = async (req: IAuthenticatedRequest & { body: IChangePasswordInput }, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }
    const result = await this.passwordService.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword
    )
    return res.status(200).json(result)
  };

  requestPasswordReset = async (req: { body: IPasswordResetRequest }, res: Response) => {
    const result = await this.passwordService.requestPasswordReset(req.body.email)
    res.status(200).json(result)
  };

  resetPassword = async (req: { body: IPasswordResetInput }, res: Response) => {
    const result = await this.passwordService.resetPassword(req.body)
    res.status(200).json(result)
  };  

  logout = async (_req: Request, res: Response) => {
    clearAuthCookies(res)
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  };
}