import { Request, Response } from 'express'
import {
  ICreateUser,
  ILoginCredentials,
  IPasswordResetRequest,
  IPasswordResetInput,
  IChangePasswordInput,
  IAuthenticatedRequest,
} from '@/types'

/**
 * Auth controller interface
 * Defines the contract for authentication controller operations
 */
export interface IAuthController {
  register(req: { body: ICreateUser }, res: Response): Promise<Response | void>
  login(req: { body: ILoginCredentials }, res: Response): Promise<Response | void>
  refreshToken(req: Request & { body: { refreshToken?: string } }, res: Response): Promise<Response | void>
  logout(req: Request, res: Response): Promise<Response | void>
  changePassword(req: IAuthenticatedRequest & { body: IChangePasswordInput }, res: Response): Promise<Response | void>
  requestPasswordReset(req: { body: IPasswordResetRequest }, res: Response): Promise<Response | void>
  resetPassword(req: { body: IPasswordResetInput }, res: Response): Promise<Response | void>
}
