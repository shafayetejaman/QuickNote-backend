import mongoose from "mongoose"
import type ISubNote from "../interfaces/subNote.interface"

const subNoteSchema = new mongoose.Schema<ISubNote>(
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
        note: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "Note",
        },
    },
    { timestamps: true },
)

export const SubNote = mongoose.model<ISubNote>("SubNote", subNoteSchema)
