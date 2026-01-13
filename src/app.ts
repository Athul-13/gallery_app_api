import express, { Application, Router } from 'express'
import 'express-async-errors'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { logger } from '@/config/logger'
import { errorHandler, notFoundHandler } from '@/middleware'
import { CORS_ORIGIN } from './config/env'

/**
 * Express Application class
 * Handles Express app configuration and middleware setup
 */
export class App {
  private app: Application

  constructor(routes: Router) {
    this.app = express()
    this.setupMiddleware()
    this.setupRoutes(routes)
    this.setupErrorHandling()
  }

  private setupMiddleware(): void {   
    this.app.use(
      cors({
        origin: CORS_ORIGIN || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    )

    this.app.use(cookieParser())
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`)
      next()
    })
  }

  private setupRoutes(routes: Router): void {
    this.app.use('/api', routes)
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler)
    this.app.use(errorHandler)
  }

  getApp(): Application {
    return this.app
  }
}
