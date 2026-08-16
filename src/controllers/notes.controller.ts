import { matchedData } from "express-validator"
import { mongo } from "mongoose"
import { Note } from "../models/notes.model"
import { SubNote } from "../models/subNotes.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import { generateNoteWithTitle } from "../utils/noteHelper"

export const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.getAllNotes(req.user!.id)

    if (!notes) throw new ApiError("User not found")

    return new ApiRespose("Notes of the user", 200, notes).send(res)
})

export const getNote = asyncHandler(async (req, res) => {
    const note = await Note.getNoteById(
        req.params.noteId as string,
        req.user!.id,
    )

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

    return new ApiRespose("Note deleted successfully", 200).send(res)
})
