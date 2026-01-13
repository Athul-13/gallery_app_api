import { Document } from 'mongoose'

/**
 * User document interface (extends Mongoose Document)
 */
export interface IUser extends Document {
  email: string
  phone: string
  password: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

/**
 * User creation input (for registration)
 */
export interface ICreateUser {
  email: string
  phone: string
  password: string
}

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
 * User login credentials
 */
export interface ILoginCredentials {
  email?: string
  phone?: string
  password: string
}
