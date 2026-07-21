import { matchedData } from "express-validator"
import { Tag } from "../models/tags.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"

export const getAllTags = asyncHandler(async (_req, res) => {
    const tags = await Tag.find()

    return new ApiRespose("Tags fetched successfully", 200, tags).send(res)
})

export const getTag = asyncHandler(async (req, res) => {
    const tag = await Tag.findById(req.params.tagId)
    if (!tag) throw new ApiError("Tag not found", 404)

    return new ApiRespose("Tag fetched successfully", 200, tag).send(res)
})

export const createTag = asyncHandler(async (req, res) => {
    const tag = await Tag.create({
        name: req.body.name,
        tagIcon: req.body.tagIcon,
    })

    return new ApiRespose("Tag created successfully", 201, tag).send(res)
})

export const updateTag = asyncHandler(async (req, res) => {
    const data = matchedData(req)
    const tag = await Tag.findByIdAndUpdate(
        req.params.tagId,
        { $set: data },
        { new: true, runValidators: true }
    )
    if (!tag) throw new ApiError("Tag not found", 404)

    return new ApiRespose("Tag updated successfully", 200, tag).send(res)
})

export const deleteTag = asyncHandler(async (req, res) => {
    const tag = await Tag.findByIdAndDelete(req.params.tagId)
    if (!tag) throw new ApiError("Tag not found", 404)

    return new ApiRespose("Tag deleted successfully", 200, {}).send(res)
})
