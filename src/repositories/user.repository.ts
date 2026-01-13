import { User } from '@/models/user'
import { IUserRepository } from './interface/user.repository.interface'
import { ICreateUser, IUser } from '@/types'
import { verifyPassword } from '@/utils/password'

/**
 * User repository implementation
 * Handles all database operations for users
 */
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password')
  }

  async findById(id: string, includePassword = false): Promise<IUser | null> {
    if (includePassword) {
      return User.findById(id).select('+password')
    }
    return User.findById(id)
  }

  async create(userData: ICreateUser): Promise<IUser> {
    return User.create(userData)
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    )
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await User.findById(userId).select('+password')
    if (!user) {
      return false
    }
    return verifyPassword(user.password, password)
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.exists({ email })
    return !!user
  }
}

// Export singleton instance
export const userRepository = new UserRepository()
