import type { INoteDoc } from "../interfaces/note.interface"
import { Note } from "../models/notes.model"

export function generateNoteWithTitle(note: INoteDoc | null) {
    const newNote = new Note()
    if (!note) return newNote

    let num = 0
    const title = note.title
    const pos = title.lastIndexOf("--")

    if (pos !== -1) {
        try {
            num += parseInt(title.slice(pos + 2, title.length), 10)
        } catch {
            num = 0
        }
    }
    newNote.title = note.title + (num > 0) ? `--${num.toString()}` : ""

    return newNote
}

export const commonNoteAggregation = () => {
    return [
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
}
