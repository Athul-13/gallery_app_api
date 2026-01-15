import { Image } from '@/models/image'
import { IImageRepository } from './interface/image.repository.interface'
import { ICreateImage, IImage, IUpdateImage } from '@/types/image'
import mongoose from 'mongoose'

/**
 * Image repository implementation
 * Handles all database operations for images
 */
export class ImageRepository implements IImageRepository {
  async findById(id: string): Promise<IImage | null> {
    return Image.findById(id)
  }

  async findByOwnerId(
    ownerId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ images: IImage[]; total: number }> {
    const page = options?.page || 1
    const limit = options?.limit || 50
    const skip = (page - 1) * limit

    // Convert ownerId to ObjectId for querying
    const ownerIdQuery = mongoose.Types.ObjectId.isValid(ownerId)
      ? new mongoose.Types.ObjectId(ownerId)
      : ownerId

    const [images, total] = await Promise.all([
      (Image.find({ ownerId: ownerIdQuery as any }) as any)
        .sort({ order: 1 }) // Sort by order ascending
        .skip(skip)
        .limit(limit),
      (Image.countDocuments({ ownerId: ownerIdQuery as any }) as any),
    ])

    return {
      images,
      total,
    }
  }

  async findByIds(ids: string[]): Promise<IImage[]> {
    const objectIds = ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id))

    return Image.find({ _id: { $in: objectIds } })
  }

  async create(imageData: ICreateImage): Promise<IImage> {
    // Convert ownerId to ObjectId if it's a string
    const ownerId = mongoose.Types.ObjectId.isValid(imageData.ownerId)
      ? new mongoose.Types.ObjectId(imageData.ownerId)
      : imageData.ownerId

    return Image.create({
      ...imageData,
      ownerId: ownerId as any,
    } as any)
  }

  async delete(id: string): Promise<void> {
    await Image.findByIdAndDelete(id)
  }

  async update(id: string, imageData: IUpdateImage): Promise<IImage | null> {
    return Image.findByIdAndUpdate(id, imageData, { new: true, runValidators: true })
  }
}
