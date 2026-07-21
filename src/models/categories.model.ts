import mongoose from "mongoose"
import ICategory from "../interfaces/category.interface"

const categorySchema = new mongoose.Schema<ICategory>({
    name: {
        type: String,
        required: true,
    },
    categoryIcon: {
        type: String,
        required: true,
    },
})

export const Category = mongoose.model<ICategory>(
    "Category",
    categorySchema
)
