import { Router } from 'express'

/**
 * Routes interface
 * Defines the contract for route modules
 */
export interface IRoutes {
  getRouter(): Router
}
