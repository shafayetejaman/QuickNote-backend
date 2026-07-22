import { matchedData } from "express-validator"
import { Note } from "../models/notes.model"
import { SubNote } from "../models/subNotes.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"

export const getSubNotesByNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.noteId,
        user: req.user?.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    const subNotes = await SubNote.find({ note: req.params.noteId })

    return new ApiRespose("SubNotes fetched successfully", 200, subNotes).send(
        res,
    )
})

export const getSubNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.noteId,
        user: req.user?.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    const subNote = await SubNote.findOne({
        _id: req.params.subNoteId,
        note: req.params.noteId,
    })
    if (!subNote) throw new ApiError("SubNote not found", 404)

    return new ApiRespose("SubNote fetched successfully", 200, subNote).send(
        res,
    )
})

export const createSubNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.noteId,
        user: req.user?.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    const subNote = new SubNote({
        title: req.body.title,
        body: req.body.body,
        color: req.body.color,
        note: req.params.noteId,
    })

    await subNote.save()

    note.subNotes.push(subNote._id)
    await note.save()

    return new ApiRespose("SubNote created successfully", 201, subNote).send(
        res,
    )
})

export const updateSubNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.noteId,
        user: req.user?.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    const data = matchedData(req)
    const subNote = await SubNote.findByIdAndUpdate(
        { _id: req.params.subNoteId, note: req.params.noteId },
        { $set: data },
        { new: true, runValidators: true },
    )
    if (!subNote) throw new ApiError("SubNote not found", 404)

    return new ApiRespose("SubNote updated successfully", 200, subNote).send(
        res,
    )
})

export const deleteSubNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.noteId,
        user: req.user?.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    const subNote = await SubNote.findOneAndDelete({
        _id: req.params.subNoteId,
        note: req.params.noteId,
    })
    if (!subNote) throw new ApiError("SubNote not found", 404)

    await Note.findByIdAndUpdate(req.params.noteId, {
        $pull: { subNotes: subNote._id },
    })

    return new ApiRespose("SubNote deleted successfully", 200, {}).send(res)
})
