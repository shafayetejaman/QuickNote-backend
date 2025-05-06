import mongoose from "mongoose"

interface TagInterface {
    name: string
    tagIcon: string
}

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
