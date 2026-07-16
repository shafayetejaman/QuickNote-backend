import { validationResult } from "express-validator"
import ApiError from "../utils/apiError"

export function validate(req, _res, next) {
    const result = validationResult(req)
    if (result.isEmpty()) {
        next()
    }
    const errors = result.array().map((error) => ({ [error.path]: error.msg }))
    throw new ApiError("Invalid data given!", 422, null, errors)
}
