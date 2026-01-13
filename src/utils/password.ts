import argon2 from 'argon2'

/**
 * Password utility functions for hashing, verification, and validation
 */

/**
 * Hash a password using argon2
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id, // Use argon2id for best security
      memoryCost: 65536, // 64 MB
      timeCost: 3, // Number of iterations
      parallelism: 4, // Number of threads
    })
    return hashedPassword
  } catch (error) {
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a password against a hash
 * @param hashedPassword - The hashed password to verify against
 * @param plainPassword - The plain text password to verify
 * @returns True if password matches, false otherwise
 */
export const verifyPassword = async (
  hashedPassword: string,
  plainPassword: string
): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, plainPassword)
  } catch (error) {
    return false
  }
}

/**
 * Password strength validation result
 */
export interface PasswordStrengthResult {
  isValid: boolean
  score: number // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[]
}

/**
 * Validate password strength and requirements
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns Password strength result
 */
export const validatePasswordStrength = (
  password: string,
  minLength: number = 6
): PasswordStrengthResult => {
  const feedback: string[] = []
  let score = 0

  // Check minimum length
  const hasMinLength = password.length >= minLength
  if (!hasMinLength) {
    feedback.push(`Password must be at least ${minLength} characters long`)
  } else {
    score++
  }

  // Check for uppercase letter
  const hasUpperCase = /[A-Z]/.test(password)
  if (!hasUpperCase) {
    feedback.push('Password should contain at least one uppercase letter')
  } else {
    score++
  }

  // Check for lowercase letter
  const hasLowerCase = /[a-z]/.test(password)
  if (!hasLowerCase) {
    feedback.push('Password should contain at least one lowercase letter')
  } else {
    score++
  }

  // Check for number
  const hasNumber = /\d/.test(password)
  if (!hasNumber) {
    feedback.push('Password should contain at least one number')
  } else {
    score++
  }

  // Check for special character
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  if (!hasSpecialChar) {
    feedback.push('Password should contain at least one special character')
  } else {
    score++
  }

  // Additional length bonus
  if (password.length >= 12) {
    score = Math.min(score + 1, 5)
  }

  // Cap score at 4 for consistency
  score = Math.min(score, 4)

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar

  return {
    isValid,
    score,
    feedback: isValid ? ['Password meets all requirements'] : feedback,
  }
}