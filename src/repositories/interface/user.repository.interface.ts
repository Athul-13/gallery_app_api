import { IUser, ICreateUser } from '@/types'

/**
 * User repository interface
 * Defines the contract for user data access operations
 * This abstraction allows for easy testing and swapping implementations
 */
export interface IUserRepository {
  /**
   * Find user by email
   * @param email - User email
   * @returns User document or null if not found (without password)
   */
  findByEmail(email: string): Promise<IUser | null>

  /**
   * Find user by email with password included
   * @param email - User email
   * @returns User document with password or null if not found
   */
  findByEmailWithPassword(email: string): Promise<IUser | null>

  /**
   * Find user by ID
   * @param id - User ID
   * @param includePassword - Whether to include password field
   * @returns User document or null if not found
   */
  findById(id: string, includePassword?: boolean): Promise<IUser | null>

  /**
   * Create a new user
   * @param userData - User creation data
   * @returns Created user document
   */
  create(userData: ICreateUser): Promise<IUser>

  /**
   * Update user password
   * @param userId - User ID
   * @param hashedPassword - Hashed password
   * @returns Updated user document or null if not found
   */
  updatePassword(userId: string, hashedPassword: string): Promise<IUser | null>

  /**
   * Verify user password
   * @param userId - User ID
   * @param password - Plain text password to verify
   * @returns True if password matches, false otherwise
   */
  verifyPassword(userId: string, password: string): Promise<boolean>

  /**
   * Check if user exists by email
   * @param email - User email
   * @returns True if user exists, false otherwise
   */
  existsByEmail(email: string): Promise<boolean>
}
