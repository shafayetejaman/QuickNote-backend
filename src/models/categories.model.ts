import mongoose from "mongoose"

interface CategoryInterface {
    name: string
    categoryIcon: string
}

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
