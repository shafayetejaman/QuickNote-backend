import { param } from "express-validator"
import { commonBodyValidator } from "./commonValidator"

export function createCategoryValidator() {
    return [
        commonBodyValidator("name").isString(),

        commonBodyValidator("categoryIcon").isString(),
    ]
}

export function updateCategoryValidator() {
    return [
        param("categoryId").isMongoId().withMessage("Invalid category ID!"),

        commonBodyValidator("name", true).isString(),

        commonBodyValidator("categoryIcon", true).isString(),
    ]
}

export function getCategoryValidator() {
    return [param("categoryId").isMongoId().withMessage("Invalid category ID!")]
}

export function deleteCategoryValidator() {
    return [param("categoryId").isMongoId().withMessage("Invalid category ID!")]
}
