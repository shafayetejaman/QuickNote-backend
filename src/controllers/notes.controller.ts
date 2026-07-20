import { Note } from "../models/notes.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import { generateNoteWithTitle } from "./notes.helper.controller"

export const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user?.id })
    if (!notes) throw new ApiError("User not found")

    return new ApiRespose("Notes of the user", 200, notes).send(res)
})

export const createNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({ title: req.body.title })
    const newNote = generateNoteWithTitle(note)

    newNote.user = req.user.id
    newNote.body = req.body.body
    newNote.color = req.body.color
    newNote.tags = req.body?.tags
    newNote.category = req.body?.category
    newNote.remainders = req.body?.remainders

    return new ApiRespose("New note created succesfully", 201, newNote).send(
        res
    )
})
