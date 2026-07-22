import { param } from "express-validator"
import { commonBodyValidator } from "./commonValidator"

export function createTagValidator() {
    return [
        commonBodyValidator("name").isString(),

        commonBodyValidator("tagIcon").isString(),
    ]
}

export function updateTagValidator() {
    return [
        param("tagId").isMongoId().withMessage("Invalid tag ID!"),

        commonBodyValidator("name", true).isString(),

        commonBodyValidator("tagIcon", true).isString(),
    ]
}

export function getTagValidator() {
    return [param("tagId").isMongoId().withMessage("Invalid tag ID!")]
}

export function deleteTagValidator() {
    return [param("tagId").isMongoId().withMessage("Invalid tag ID!")]
}
