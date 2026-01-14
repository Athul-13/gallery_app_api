import { IImage } from "@/types/image";
import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema<IImage>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        url: {
            type: String,
            required: [true, 'URL is required'],
        },
        order: {
            type: Number,
            required: [true, 'Order is required'],
            default: 0,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'Owner ID is required'],
            index: true,
        } as any,
    },
    { timestamps: true }
)

imageSchema.index({ ownerId: 1, order: 1 })

// Pre-save hook to auto-increment order if not provided
imageSchema.pre('save', async function (next) {
    const doc = this as unknown as IImage & mongoose.Document
    if (doc.isNew && (doc.order === undefined || doc.order === 0)) {
        try {
            const maxOrderImage = await (mongoose.model<IImage>('Image') as any)
                .findOne({ ownerId: doc.ownerId })
                .sort({ order: -1 })
                .select('order')
                .lean()
            
            doc.order = maxOrderImage ? maxOrderImage.order + 1 : 1
        } catch (error) {
            return (next as any)(error as Error)
        }
    }
    return (next as any)()
})

export const Image = mongoose.model<IImage>("Image", imageSchema)