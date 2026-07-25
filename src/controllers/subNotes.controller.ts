import { matchedData } from "express-validator"
import { mongo } from "mongoose"
import { Note } from "../models/notes.model"
import { SubNote } from "../models/subNotes.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"

export const createSubNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({
        _id: req.params.noteId,
        user: req.user!.id,
    })
    if (!note) throw new ApiError("Note not found", 404)

    const { title, body, color } = matchedData(req)

    const subNote = await SubNote.create({
        title,
        body,
        color: new mongo.ObjectId(color as string),
        note: new mongo.ObjectId(req.params.noteId as string),
    })

    note.subNotes.push(subNote._id as mongo.ObjectId)
    await note.save()

    return new ApiRespose("SubNote created successfully", 201, subNote).send(
        res,
    )
})

export const updateSubNote = asyncHandler(async (req, res) => {
    const { subNoteId, ...updateData } = matchedData(req)

    const subNote = await SubNote.findOneAndUpdate(
        {
            _id: subNoteId,
            note: req.params.noteId,
        },
        { $set: updateData },
        { new: true },
    )

    if (!subNote) throw new ApiError("SubNote not found", 404)

    return new ApiRespose("SubNote updated successfully", 200, subNote).send(
        res,
    )
})

export const deleteSubNote = asyncHandler(async (req, res) => {
    const subNote = await SubNote.findOneAndDelete({
        _id: req.params.subNoteId,
        note: req.params.noteId,
    })
    if (!subNote) throw new ApiError("SubNote not found", 404)

    await Note.findByIdAndUpdate(req.params.noteId, {
        $pull: { subNotes: subNote._id },
    })

    return new ApiRespose("SubNote deleted successfully", 200).send(res)
})
