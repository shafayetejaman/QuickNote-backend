import mongoose from "mongoose"
import TagInterface from "../interfaces/tag.interface"

const tagSchema = new mongoose.Schema<TagInterface>({
    name: {
        type: String,
        required: true,
    },
    tagIcon: {
        type: String,
        required: true,
    },
})

export const Tag = mongoose.model<TagInterface>("Tag", tagSchema)
