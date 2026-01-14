import winston from 'winston'

/**
 * Configure and export Winston logger instance
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(    
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({level, message, timestamp, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : ''
          return `${timestamp} [${level}]: ${message} ${metaString}`
        })
      ),
    }),
  ],
})
