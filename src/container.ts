import { AuthController } from '@/controllers'
import { AuthService, PasswordService, UserService } from '@/services'
import { UserRepository } from '@/repositories'
import { IAuthController } from '@/controllers/interface'
import { IAuthService, IPasswordService, IUserService } from '@/services/interface'
import { IUserRepository } from '@/repositories/interface'

class Container {
  private instances = new Map<string, any>()

  /**
   * Register a singleton instance
   */
  register<T>(key: string, factory: () => T): void {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory())
    }
  }

  /**
   * Get a registered instance
   */
  get<T>(key: string): T {
    const instance = this.instances.get(key)
    if (!instance) {
      throw new Error(`Dependency "${key}" not found in container`)
    }
    return instance as T
  }

  /**
   * Initialize all dependencies
   */
  initialize(): void {
    // Register repositories (bottom layer)
    this.register<IUserRepository>('userRepository', () => new UserRepository())

    // Register services (middle layer)
    this.register<IAuthService>('authService', () => 
      new AuthService(this.get<IUserRepository>('userRepository'))
    )
    
    this.register<IPasswordService>('passwordService', () => 
      new PasswordService(this.get<IUserRepository>('userRepository'))
    )
    
    this.register<IUserService>('userService', () => 
      new UserService(this.get<IUserRepository>('userRepository'))
    )

    // Register controllers (top layer)
    this.register<IAuthController>('authController', () => 
      new AuthController(
        this.get<IAuthService>('authService'),
        this.get<IPasswordService>('passwordService')
      )
    )
  }
}

// Create and initialize container
export const container = new Container()
container.initialize()

// Export convenience getters
export const getUserRepository = () => container.get<IUserRepository>('userRepository')
export const getAuthService = () => container.get<IAuthService>('authService')
export const getPasswordService = () => container.get<IPasswordService>('passwordService')
export const getUserService = () => container.get<IUserService>('userService')
export const getAuthController = () => container.get<IAuthController>('authController')
