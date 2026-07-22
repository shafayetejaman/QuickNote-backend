import { body, query, type ValidationChain } from "express-validator"

export function commonBodyValidator(
    name: string,
    optional = false,
    baseMessage = `Invalid ${name}!`,
) {
    let Body: ValidationChain
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
    baseMessage = `Invalid param ${name}!`,
) {
    let Query: ValidationChain
    if (optional) Query = query(name, baseMessage).optional()
    else
        Query = query(name, baseMessage)
            .exists()
            .withMessage(`${name} not given!`)

    return Query.trim().notEmpty().withMessage(`${name} is empty!`).escape()
}
