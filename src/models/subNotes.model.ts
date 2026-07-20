import mongoose from "mongoose"
import SubNoteInterface from "../interfaces/subNote.interface"

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
