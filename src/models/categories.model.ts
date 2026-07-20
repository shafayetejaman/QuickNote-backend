import mongoose from "mongoose"
import CategoryInterface from "../interfaces/category.interface"

const categorySchema = new mongoose.Schema<CategoryInterface>({
    name: {
        type: String,
        required: true,
    },
    categoryIcon: {
        type: String,
        required: true,
    },
})

export const Category = mongoose.model<CategoryInterface>(
    "Category",
    categorySchema
)
