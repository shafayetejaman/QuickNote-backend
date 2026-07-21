import { commonBodyValidator } from "./commonValidator"
import { param } from "express-validator"

export function createSubNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),

        commonBodyValidator("title")
            .isString()
            .isLength({ max: 50 })
            .withMessage("Title must be at most 50 characters"),

        commonBodyValidator("body")
            .isString()
            .isLength({ max: 200 })
            .withMessage("Body must be at most 200 characters"),

        commonBodyValidator("color", true).isMongoId(),
    ]
}

export function updateSubNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),

        param("subNoteId").isMongoId().withMessage("Invalid subNote ID!"),

        commonBodyValidator("title", true)
            .isString()
            .isLength({ max: 50 })
            .withMessage("Title must be at most 50 characters"),

        commonBodyValidator("body", true)
            .isString()
            .isLength({ max: 200 })
            .withMessage("Body must be at most 200 characters"),

        commonBodyValidator("color", true).isMongoId(),
    ]
}

export function getSubNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),
        param("subNoteId").isMongoId().withMessage("Invalid subNote ID!"),
    ]
}

export function deleteSubNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),
        param("subNoteId").isMongoId().withMessage("Invalid subNote ID!"),
    ]
}
