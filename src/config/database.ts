import mongoose from 'mongoose'
import { MONGODB_URI } from './env'
import { logger } from './logger'

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const options: mongoose.ConnectOptions = {
      // These options are recommended for Mongoose 6+
    }

    await mongoose.connect(MONGODB_URI, options)

    logger.info('MongoDB connected successfully')

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed due to app termination')
      process.exit(0)
    })
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

/**
 * Disconnect from MongoDB database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    logger.info('MongoDB disconnected successfully')
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error)
    throw error
  }
}
