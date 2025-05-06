import mongoose, { Types } from "mongoose"

interface NoteInterface {
    user: Types.ObjectId
    title: string
    body: string
    color: Types.ObjectId
    subNotes: Types.ObjectId[]
    tags: Types.ObjectId[]
    category: Types.ObjectId
    remainders: [Date]
}

const noteSchema = new mongoose.Schema<NoteInterface>(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
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
            ref: "Color",
            required: true,
        },
        subNotes: {
            type: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: "SubNote",
                },
            ],
        },
        tags: {
            type: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: "Tag",
                },
            ],
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
        },
        remainders: {
            type: [
                {
                    type: Date,
                },
            ],
        },
    },
    { timestamps: true }
)

export const Note = mongoose.model<NoteInterface>("Note", noteSchema)
