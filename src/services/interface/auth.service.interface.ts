import { ICreateUser, ILoginCredentials } from '@/types'

/**
 * User registration response
 */
export interface IUserRegistrationResponse {
  id: string
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

/**
 * User login response
 */
export interface IUserLoginResponse {
  user: {
    id: string
    email: string
    phone: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

/**
 * Token refresh response
 */
export interface ITokenRefreshResponse {
  accessToken: string
  user: {
    id: string
    email: string
    phone: string
  }
}

/**
 * Authentication service interface
 * Defines the contract for authentication operations
 */
export interface IAuthService {
  registerUser(userData: ICreateUser): Promise<IUserRegistrationResponse>
  loginUser(credentials: ILoginCredentials): Promise<IUserLoginResponse>
  refreshAccessToken(refreshToken: string): Promise<ITokenRefreshResponse>
}
