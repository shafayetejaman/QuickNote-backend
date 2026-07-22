import { matchedData } from "express-validator"
import { Category } from "../models/categories.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"

export const getAllCategories = asyncHandler(async (_req, res) => {
    const categories = await Category.find()

    return new ApiRespose(
        "Categories fetched successfully",
        200,
        categories,
    ).send(res)
})

export const getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.categoryId)
    if (!category) throw new ApiError("Category not found", 404)

    return new ApiRespose("Category fetched successfully", 200, category).send(
        res,
    )
})

export const createCategory = asyncHandler(async (req, res) => {
    const category = await Category.create({
        name: req.body.name,
        categoryIcon: req.body.categoryIcon,
    })

    return new ApiRespose("Category created successfully", 201, category).send(
        res,
    )
})

export const updateCategory = asyncHandler(async (req, res) => {
    const data = matchedData(req)
    const category = await Category.findByIdAndUpdate(
        req.params.categoryId,
        { $set: data },
        { new: true, runValidators: true },
    )
    if (!category) throw new ApiError("Category not found", 404)

    return new ApiRespose("Category updated successfully", 200, category).send(
        res,
    )
})

export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.categoryId)
    if (!category) throw new ApiError("Category not found", 404)

    return new ApiRespose("Category deleted successfully", 200, {}).send(res)
})
