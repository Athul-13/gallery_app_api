/**
 * User response (without password)
 */
export interface IUserResponse {
  id: string
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

/**
 * User service interface
 * Defines the contract for user operations
 */
export interface IUserService {
  getUserById(userId: string): Promise<IUserResponse>
}
