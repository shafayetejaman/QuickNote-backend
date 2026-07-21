import { matchedData } from "express-validator"
import { Color } from "../models/colors.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"

export const getAllColors = asyncHandler(async (_req, res) => {
    const colors = await Color.find()

    return new ApiRespose("Colors fetched successfully", 200, colors).send(res)
})

export const getColor = asyncHandler(async (req, res) => {
    const color = await Color.findById(req.params.colorId)
    if (!color) throw new ApiError("Color not found", 404)

    return new ApiRespose("Color fetched successfully", 200, color).send(res)
})

export const createColor = asyncHandler(async (req, res) => {
    const color = await Color.create({
        colorName: req.body.colorName,
        hex: req.body.hex,
    })

    return new ApiRespose("Color created successfully", 201, color).send(res)
})

export const updateColor = asyncHandler(async (req, res) => {
    const data = matchedData(req)
    const color = await Color.findByIdAndUpdate(
        req.params.colorId,
        { $set: data },
        { new: true, runValidators: true }
    )
    if (!color) throw new ApiError("Color not found", 404)

    return new ApiRespose("Color updated successfully", 200, color).send(res)
})

export const deleteColor = asyncHandler(async (req, res) => {
    const color = await Color.findByIdAndDelete(req.params.colorId)
    if (!color) throw new ApiError("Color not found", 404)

    return new ApiRespose("Color deleted successfully", 200, {}).send(res)
})
