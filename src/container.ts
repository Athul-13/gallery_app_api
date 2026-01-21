import { AuthController, ImageController } from '@/controllers'
import { AuthService, PasswordService, UserService, ImageService, JwtService } from '@/services'
import { UserRepository, ImageRepository } from '@/repositories'
import { IAuthController, IImageController } from '@/controllers/interface'
import { IAuthService, IPasswordService, IUserService, IImageService, IJwtService } from '@/services/interface'
import { IUserRepository, IImageRepository } from '@/repositories/interface'

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
    this.register<IImageRepository>('imageRepository', () => new ImageRepository())

    // Register utility services (foundation layer)
    this.register<IJwtService>('jwtService', () => new JwtService())

    // Register services (middle layer)
    this.register<IAuthService>('authService', () => 
      new AuthService(
        this.get<IUserRepository>('userRepository'),
        this.get<IJwtService>('jwtService')
      )
    )
    
    this.register<IPasswordService>('passwordService', () => 
      new PasswordService(
        this.get<IUserRepository>('userRepository'),
        this.get<IJwtService>('jwtService')
      )
    )
    
    this.register<IUserService>('userService', () => 
      new UserService(this.get<IUserRepository>('userRepository'))
    )

    this.register<IImageService>('imageService', () => 
      new ImageService(this.get<IImageRepository>('imageRepository'))
    )

    // Register controllers (top layer)
    this.register<IAuthController>('authController', () => 
      new AuthController(
        this.get<IAuthService>('authService'),
        this.get<IPasswordService>('passwordService')
      )
    )

    this.register<IImageController>('imageController', () => 
      new ImageController(this.get<IImageService>('imageService'))
    )
  }
}

// Create and initialize container
export const container = new Container()
container.initialize()

// Export convenience getters
export const getUserRepository = () => container.get<IUserRepository>('userRepository')
export const getImageRepository = () => container.get<IImageRepository>('imageRepository')
export const getJwtService = () => container.get<IJwtService>('jwtService')
export const getAuthService = () => container.get<IAuthService>('authService')
export const getPasswordService = () => container.get<IPasswordService>('passwordService')
export const getUserService = () => container.get<IUserService>('userService')
export const getImageService = () => container.get<IImageService>('imageService')
export const getAuthController = () => container.get<IAuthController>('authController')
export const getImageController = () => container.get<IImageController>('imageController')