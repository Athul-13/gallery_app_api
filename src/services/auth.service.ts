import { 
  ILoginCredentials,
  ICreateUser,
  createError,
} from '@/types'
import { IUserRepository } from '@/repositories/interface'
import { userRepository } from '@/repositories'
import { hashPassword, validatePasswordStrength } from '@/utils/password'
import { generateTokenPair, verifyToken } from '@/utils/jwt'
import { logger } from '@/config/logger'

/**
 * Authentication service
 * Handles user registration, login, and token refresh
 */
export class AuthService {
  constructor(
    private repo: IUserRepository = userRepository
  ) {}

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns User object without password
   */
  async registerUser(userData: ICreateUser) {
    const { email, phone, password } = userData

    const existingUser = await this.repo.findByEmail(email)

    if (existingUser) {
      throw createError(409, 'User with this email already exists')
    }

    const passwordValidation = validatePasswordStrength(password, 6)
    if (!passwordValidation.isValid) {
      throw createError(400, `Password does not meet requirements: ${passwordValidation.feedback.join(', ')}`)
    }

    const hashedPassword = await hashPassword(password)

    const user = await this.repo.create({
      email,
      phone,
      password: hashedPassword,
    })

    logger.info(`User registered: ${user.email}`)

    return {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  /**
   * Login user with email
   * @param credentials - Login credentials
   * @returns User object and tokens
   */
  async loginUser(credentials: ILoginCredentials) {
    const { email, password } = credentials

    if (!email) {
      throw createError(400, 'Email is required')
    }

    const user = await this.repo.findByEmailWithPassword(email)
    if (!user) {
      throw createError(401, 'Invalid email or password')
    }

    const isPasswordValid = await this.repo.verifyPassword(user._id.toString(), password)
    if (!isPasswordValid) {
      throw createError(401, 'Invalid email or password')
    }

    const tokens = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
    })

    logger.info(`User logged in: ${user.email}`)

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
      },
      tokens,
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token string
   * @returns New access token
   */
  async refreshAccessToken(refreshToken: string) {
    const payload = verifyToken(refreshToken)

    const user = await this.repo.findById(payload.userId)
    if (!user) {
      throw createError(401, 'User not found')
    }

    const { accessToken } = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
    })

    return {
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
      },
    }
  }
}

export const authService = new AuthService()

export const registerUser = (userData: ICreateUser) => authService.registerUser(userData)
export const loginUser = (credentials: ILoginCredentials) => authService.loginUser(credentials)
export const refreshAccessToken = (refreshToken: string) => authService.refreshAccessToken(refreshToken)
