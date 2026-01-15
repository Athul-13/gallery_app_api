import { Server as HttpServer } from 'http'
import { App } from './app'
import { connectDatabase } from './config/database'
import { PORT } from './config/env'
import { logger } from './config/logger'
import { initializeEmailTransporter } from './utils/email'

export class Server {
  private app: App
  private server: HttpServer | null = null

  constructor(app: App) {
    this.app = app
  }

  async start(): Promise<void> {
    await connectDatabase()
    logger.info('Database connected successfully')
    
    await initializeEmailTransporter()
    
    const expressApp = this.app.getApp()
    this.server = expressApp.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })

    process.on('SIGTERM', () => this.shutdown())
    process.on('SIGINT', () => this.shutdown())
  }

  private shutdown(): void {
    if (this.server) {
      this.server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    }
  }
}
