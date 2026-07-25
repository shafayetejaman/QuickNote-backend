import { param } from "express-validator"
import { commonBodyValidator, ValidatorType } from "./commonValidator"

export function createSubNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),

        commonBodyValidator("title", false, undefined, ValidatorType.String)
            .isLength({ min: 2, max: 50 })
            .withMessage("Title must be between 2 and 50 characters"),

        commonBodyValidator("body", false, undefined, ValidatorType.String)
            .isLength({ max: 200 })
            .withMessage("Body must not exceed 200 characters"),

        commonBodyValidator("color", false, undefined, ValidatorType.ObjectId),
    ]
}

export function updateSubNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),
        param("subNoteId").isMongoId().withMessage("Invalid subnote ID!"),

        commonBodyValidator("title", true, undefined, ValidatorType.String)
            .isLength({ min: 2, max: 50 })
            .withMessage("Title must be between 2 and 50 characters"),

        commonBodyValidator("body", true, undefined, ValidatorType.String)
            .isLength({ max: 200 })
            .withMessage("Body must not exceed 200 characters"),

        commonBodyValidator("color", true, undefined, ValidatorType.ObjectId),
    ]
}

export function deleteSubNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),
        param("subNoteId").isMongoId().withMessage("Invalid subnote ID!"),
    ]
}
