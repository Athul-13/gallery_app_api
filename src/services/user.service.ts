import { createError } from '@/types'
import { IUserRepository } from '@/repositories/interface'
import { userRepository } from '@/repositories'

/**
 * User service
 */
export class UserService {
  constructor(
    private repo: IUserRepository = userRepository
  ) {}

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User object without password
   */
  async getUserById(userId: string) {
    const user = await this.repo.findById(userId)
    if (!user) {
      throw createError(404, 'User not found')
    }

    return {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}

export const userService = new UserService()
