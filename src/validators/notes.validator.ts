import { param } from "express-validator"
import mongoose from "mongoose"
import { commonBodyValidator, ValidatorType } from "./commonValidator"

export function createNoteValidator() {
    return [
        commonBodyValidator("title", false, undefined, ValidatorType.String)
            .isLength({ min: 2, max: 50 })
            .withMessage("Title must be between 2 and 50 characters"),

        commonBodyValidator("body", false, undefined, ValidatorType.String),

        commonBodyValidator("color", true, undefined, ValidatorType.ObjectId),

        commonBodyValidator(
            "tags",
            true,
            undefined,
            ValidatorType.Array,
        ).custom((tags: string[]) => {
            tags.forEach((tag) => {
                if (
                    typeof tag !== "string" ||
                    tag.length === 0 ||
                    !mongoose.Types.ObjectId.isValid(tag)
                ) {
                    throw new Error("Each tag must be a non-empty string")
                }
            })
            return true
        }),

        commonBodyValidator(
            "category",
            true,
            undefined,
            ValidatorType.ObjectId,
        ),

        commonBodyValidator(
            "remainders",
            true,
            undefined,
            ValidatorType.Array,
        ).custom((remainders: string[]) => {
            remainders.forEach((r) => {
                if (typeof r !== "string" || Number.isNaN(Date.parse(r))) {
                    throw new Error(
                        "Each remainder must be a valid ISO 8601 date",
                    )
                }
            })
            return true
        }),
    ]
}

export function updateNoteValidator() {
    return [
        param("noteId").isMongoId().withMessage("Invalid note ID!"),

        commonBodyValidator("title", true, undefined, ValidatorType.String)
            .isLength({ min: 2, max: 50 })
            .withMessage("Title must be between 2 and 50 characters"),

        commonBodyValidator("body", true, undefined, ValidatorType.String),

        commonBodyValidator("color", true, undefined, ValidatorType.ObjectId),

        commonBodyValidator(
            "tags",
            true,
            undefined,
            ValidatorType.Array,
        ).custom((tags: string[]) => {
            tags.forEach((tag) => {
                if (
                    typeof tag !== "string" ||
                    tag.length === 0 ||
                    !mongoose.Types.ObjectId.isValid(tag)
                ) {
                    throw new Error("Each tag must be a non-empty string")
                }
            })
            return true
        }),

        commonBodyValidator(
            "category",
            true,
            undefined,
            ValidatorType.ObjectId,
        ),

        commonBodyValidator(
            "remainders",
            true,
            undefined,
            ValidatorType.Array,
        ).custom((remainders: string[]) => {
            remainders.forEach((r) => {
                if (typeof r !== "string" || Number.isNaN(Date.parse(r))) {
                    throw new Error(
                        "Each remainder must be a valid ISO 8601 date",
                    )
                }
            })
            return true
        }),
    ]
}

export function getNoteValidator() {
    return [param("noteId").isMongoId().withMessage("Invalid note ID!")]
}

export function deleteNoteValidator() {
    return [param("noteId").isMongoId().withMessage("Invalid note ID!")]
}
