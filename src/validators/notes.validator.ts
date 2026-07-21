import { commonBodyValidator } from "./commonValidator"
import { param } from "express-validator"

const invalidDomian: string[] = []

export function createNoteValidator() {
    return [
        commonBodyValidator("title")
            .isString()
            .isLength({ min: 2, max: 50 })
            .withMessage("Title must be between 2 and 50 characters"),

        commonBodyValidator("body").isString(),

        commonBodyValidator("color", true).isMongoId(),

        commonBodyValidator("tags", true).isArray({ min: 1 }),

        commonBodyValidator("category", true).isMongoId(),

        commonBodyValidator("remainders", true).isArray({ min: 1 }),
    ]
}

export function updateNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),

        commonBodyValidator("title", true)
            .isString()
            .isLength({ min: 2, max: 50 })
            .withMessage("Title must be between 2 and 50 characters"),

        commonBodyValidator("body", true).isString(),

        commonBodyValidator("color", true).isMongoId(),

        commonBodyValidator("tags", true).isArray({ min: 1 }),

        commonBodyValidator("category", true).isMongoId(),

        commonBodyValidator("remainders", true).isArray({ min: 1 }),
    ]
}

export function getNoteValidator() {
    return [param("noteId").isMongoId().withMessage("Invalid note ID!")]
}

export function deleteNoteValidator() {
    return [param("noteId").isMongoId().withMessage("Invalid note ID!")]
}
