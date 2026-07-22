import mongoose from "mongoose"
import type ITag from "../interfaces/tag.interface"

const tagSchema = new mongoose.Schema<ITag>({
    name: {
        type: String,
        required: true,
    },
    tagIcon: {
        type: String,
        required: true,
    },
})

export const Tag = mongoose.model<ITag>("Tag", tagSchema)
