import mongoose, { Types } from "mongoose"

interface SubNoteInterface {
    title: string
    body: string
    color: Types.ObjectId
}

const subNoteSchema = new mongoose.Schema<SubNoteInterface>(
    {
        title: {
            type: String,
            required: true,
            maxlength: 50,
        },
        body: {
            type: String,
            required: true,
            maxlength: 200,
        },
        color: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "Color",
        },
    },
    { timestamps: true }
)

export const SubNote = mongoose.model<SubNoteInterface>(
    "SubNote",
    subNoteSchema
)
