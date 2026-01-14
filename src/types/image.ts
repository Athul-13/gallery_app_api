import { Document } from "mongoose"

/**
 * Image document interface (extends Mongoose Document)
 */
export interface IImage extends Document {
  title: string
  url: string
  order: number
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Image creation input (for single image upload)
 */
export interface ICreateImage {
  title: string
  url: string
  ownerId: string
  order?: number // Optional, will be auto-incremented if not provided
}

/**
 * Bulk image creation input (for multiple image uploads)
 */
export interface ICreateBulkImages {
  images: Array<{
    title: string
    url: string
  }>
  ownerId: string
}

/**
 * Image response (without internal fields)
 */
export interface IImageResponse {
  id: string
  title: string
  url: string
  order: number
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Bulk image upload response
 */
export interface IBulkImageResponse {
  images: IImageResponse[]
  total: number
}