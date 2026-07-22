import { matchedData } from "express-validator"
import mongoose, { mongo } from "mongoose"
import { Note } from "../models/notes.model"
import { SubNote } from "../models/subNotes.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import { generateNoteWithTitle } from "./notes.helper.controller"

export const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user?.id })
    if (!notes) throw new ApiError("User not found")

    return new ApiRespose("Notes of the user", 200, notes).send(res)
})

export const getNote = asyncHandler(async (req, res) => {
    const note = await Note.aggregate([
        { $match: { _id: new mongo.ObjectId(req.query.id as string) } },
        {
            $lookup: {
                from: "$subNotes",
                localField: "",
                foreignField: "",
                as: "subNotes",
            },
        },
    ])
    if (!note) throw new ApiError("Note not found", 404)

    return new ApiRespose("Note fetched successfully", 200, note).send(res)
})

export const createNote = asyncHandler(async (req, res) => {
    const existing = await Note.findOne({ title: req.body.title })
    const newNote = generateNoteWithTitle(existing)

    newNote.user = new mongoose.Types.ObjectId(req.user?.id)
    newNote.body = req.body.body

    if (req.body.color) newNote.color = req.body.color
    if (req.body.tags) newNote.tags = req.body.tags
    if (req.body.category) newNote.category = req.body.category
    if (req.body.remainders) newNote.remainders = req.body.remainders

    await newNote.save()

    return new ApiRespose("New note created succesfully", 201, newNote).send(
        res,
    )
})

export const updateNote = asyncHandler(async (req, res) => {
    const data = matchedData(req)

    if (data.title) {
        const existing = await Note.findOne({ title: data.title })
        if (existing) throw new ApiError("Title already exists", 409)
    }

    const note = await Note.findByIdAndUpdate(
        { _id: req.params.noteId, user: req.user?.id },
        { $set: data },
        { new: true, runValidators: true },
    )
    if (!note) throw new ApiError("Note not found", 404)

    return new ApiRespose("Note updated successfully", 200, note).send(res)
})

export const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findOneAndDelete({
        _id: req.params.noteId,
        user: req.user?.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    await SubNote.deleteMany({ _id: { $in: note.subNotes } })

    return new ApiRespose("Note deleted successfully", 200, {}).send(res)
})
