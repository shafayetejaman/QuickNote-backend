import { Note } from "../models/notes.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"

export const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user.id })
    if (!notes) throw ApiError("User not found")

    return ApiRespose("Notes of the user", 200, notes)
})
