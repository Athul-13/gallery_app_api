import { Document } from "mongoose"
import { IAuthenticatedRequest } from "./auth"

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

export interface IUpdateImage {
  title?: string
  url?: string
  order?: number
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

/**
 * Upload images request body
 */
export interface IUploadImagesBody {
  title?: string // For single upload
  titles?: string[] // For bulk upload
}

/**
 * Upload images request (with multer files)
 */
export interface IUploadImagesRequest extends IAuthenticatedRequest {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }
  file?: Express.Multer.File
  body: IUploadImagesBody
}

/**
 * Get image by ID request (with params)
 */
export interface IGetImageByIdRequest extends IAuthenticatedRequest {
  params: {
    id: string
  }
}

/**
 * Get user images request (with query params)
 */
export interface IGetUserImagesRequest extends IAuthenticatedRequest {
  query: {
    page?: string
    limit?: string
  }
}

/**
 * Delete image request (with params)
 */
export interface IDeleteImageRequest extends IAuthenticatedRequest {
  params: {
    id: string
  }
}

/**
 * Update image request (with params, body, and optional file)
 */
export interface IUpdateImageRequest extends IAuthenticatedRequest {
  params: {
    id: string
  }
  body: IUpdateImage
  file?: Express.Multer.File
}

/**
 * Bulk order update request body
 */
export interface IBulkOrderUpdateBody {
  orders: Array<{
    id: string
    order: number
  }>
}

/**
 * Bulk order update request
 */
export interface IBulkOrderUpdateRequest extends IAuthenticatedRequest {
  body: IBulkOrderUpdateBody
}

/**
 * Bulk order update response
 */
export interface IBulkOrderUpdateResponse {
  images: IImageResponse[]
  total: number
}