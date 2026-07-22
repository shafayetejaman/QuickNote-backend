import mongoose from "mongoose"
import type INote from "../interfaces/note.interface"

const noteSchema = new mongoose.Schema<INote>(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 50,
            unique: true,
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
    { timestamps: true },
)

export const Note = mongoose.model<INote>("Note", noteSchema)
