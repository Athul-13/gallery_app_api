import mongoose, { Schema } from 'mongoose'
import argon2 from 'argon2'
import { IUser } from '@/types/user'

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
)

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(this.password, candidatePassword)
  } catch (error) {
    return false
  }
}

// Create and export the model
export const User = mongoose.model<IUser>('User', userSchema)
