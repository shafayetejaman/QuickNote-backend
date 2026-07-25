import { matchedData } from "express-validator"
import { mongo } from "mongoose"
import { Note } from "../models/notes.model"
import { SubNote } from "../models/subNotes.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import {
    commonNoteAggregation,
    generateNoteWithTitle,
} from "./notes.helper.controller"

export const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.aggregate([
        {
            $match: {
                user: new mongo.ObjectId(req.user!.id),
            },
        },
        ...commonNoteAggregation(),
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

    if (!notes) throw new ApiError("User not found")

    return new ApiRespose("Notes of the user", 200, notes).send(res)
})

export const getNote = asyncHandler(async (req, res) => {
    const note = await Note.aggregate([
        {
            $match: {
                _id: new mongo.ObjectId(req.params.noteId as string),
                user: new mongo.ObjectId(req.user!.id),
            },
        },
        ...commonNoteAggregation(),
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

    if (!note) throw new ApiError("Note not found", 404)

    return new ApiRespose("Note fetched successfully", 200, note).send(res)
})

export const createOrUpdateNote = asyncHandler(async (req, res) => {
    let existing = null
    if (req.body.title) existing = await Note.findOne({ title: req.body.title })
    const newNote = generateNoteWithTitle(existing)

    newNote.user = new mongo.ObjectId(req.user!.id)
    const { title, ...rest } = matchedData(req)

    newNote.set(rest)
    await newNote.save()

    return new ApiRespose(
        "New note created or updated succesfully",
        201,
        newNote,
    ).send(res)
})

export const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findOneAndDelete({
        _id: req.params.noteId,
        user: req.user!.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    await SubNote.deleteMany({ _id: { $in: note.subNotes } })

    return new ApiRespose("Note deleted successfully", 200, {}).send(res)
})
