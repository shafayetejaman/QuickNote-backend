import mongoose, { mongo } from "mongoose"
import type INote from "../interfaces/note.interface"

interface INoteModel extends mongoose.Model<INote> {
    getAllNotes(userId: string): Promise<unknown[]>
    getNoteById(noteId: string, userId: string): Promise<unknown[]>
}

const commonNoteAggregation = [
    {
        $lookup: {
            from: "tags",
            localField: "tags",
            foreignField: "_id",
            as: "tags",
        },
    },
    {
        $lookup: {
            from: "colors",
            localField: "color",
            foreignField: "_id",
            as: "color",
            pipeline: [
                {
                    $unset: ["_id", "colorName", "__v"],
                },
            ],
        },
    },
    {
        $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
        },
    },
    {
        $addFields: {
            color: { $first: "$color.hex" },
            category: { $first: "$category" },
        },
    },
]

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

noteSchema.statics.getAllNotes = function (userId: string) {
    return this.aggregate([
        {
            $match: {
                user: new mongo.ObjectId(userId),
            },
        },
        ...commonNoteAggregation,
        {
            $project: {
                body: 0,
                subNotes: 0,
                createdAt: 0,
                remainders: 0,
                user: 0,
                __v: 0,
            },
        },
    ])
}

noteSchema.statics.getNoteById = function (noteId: string, userId: string) {
    return this.aggregate([
        {
            $match: {
                _id: new mongo.ObjectId(noteId),
                user: new mongo.ObjectId(userId),
            },
        },
        ...commonNoteAggregation,
        {
            $lookup: {
                from: "subnotes",
                localField: "subNotes",
                foreignField: "_id",
                as: "subNotes",
                pipeline: [
                    {
                        $unset: ["note"],
                    },
                    {
                        $lookup: {
                            from: "colors",
                            localField: "color",
                            foreignField: "_id",
                            as: "color",
                            pipeline: [
                                {
                                    $unset: ["_id", "colorName", "__v"],
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            color: { $first: "$color.hex" },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                user: 0,
                __v: 0,
            },
        },
    ])
}

export const Note = mongoose.model<INote, INoteModel>("Note", noteSchema)
