import { RequestHandler } from "express"
import { body, query, validationResult } from "express-validator"
import ApiError from "../utils/apiError"

export const validate: RequestHandler = (req, _res, next) => {
    const result = validationResult(req)
    if (result.isEmpty()) {
        return next()
    }
    const errors = result.array().map((error) => {
        if (error.type === "field") return { [error.path]: error.msg }
        return error.msg
    })

    throw new ApiError("Invalid data given!", 422, null, errors)
}

export function commonBodyValidator(
    name: string,
    optional = false,
    baseMessage = `Invalid ${name}!`
) {
    let Body
    if (optional) Body = body(name, baseMessage).optional()
    else
        Body = body(name, baseMessage)
            .exists()
            .withMessage(`${name} not given!`)

    return Body.trim().notEmpty().withMessage(`${name} is empty!`).escape()
}

export function commonQueryValidator(
    name: string,
    optional = false,
    baseMessage = `Invalid param ${name}!`
) {
    let Query
    if (optional) Query = query(name, baseMessage).optional()
    else
        Query = query(name, baseMessage)
            .exists()
            .withMessage(`${name} not given!`)

    return Query.trim().notEmpty().withMessage(`${name} is empty!`).escape()
}
