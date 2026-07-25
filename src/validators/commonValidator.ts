import { body, query, type ValidationChain } from "express-validator"

export enum ValidatorType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Date = "date",
    ObjectId = "objectId",
    Email = "email",
    Array = "array",
}

function applyTypeCheck(
    chain: ValidationChain,
    type: ValidatorType,
): ValidationChain {
    switch (type) {
        case ValidatorType.String:
            return chain.isString().withMessage("Must be a string")
        case ValidatorType.Number:
            return chain.isNumeric().withMessage("Must be a number")
        case ValidatorType.Boolean:
            return chain.isBoolean().withMessage("Must be a boolean")
        case ValidatorType.Date:
            return chain.isISO8601().withMessage("Must be a valid date")
        case ValidatorType.ObjectId:
            return chain.isMongoId().withMessage("Must be a valid ID")
        case ValidatorType.Email:
            return chain.isEmail().withMessage("Must be a valid email")
        case ValidatorType.Array:
            return chain.isArray().withMessage("Must be an array")
    }
}

export function commonBodyValidator(
    name: string,
    optional = false,
    baseMessage = `Invalid ${name}!`,
    type: ValidatorType = ValidatorType.String,
) {
    let chain: ValidationChain
    if (optional) chain = body(name, baseMessage).optional()
    else
        chain = body(name, baseMessage)
            .exists()
            .withMessage(`${name} not given!`)

    chain = applyTypeCheck(chain, type)

    if (type === ValidatorType.String) {
        return chain
            .trim()
            .notEmpty()
            .withMessage(`${name} is empty!`)
            .escape()
    }

    return chain
}

export function commonQueryValidator(
    name: string,
    optional = false,
    baseMessage = `Invalid param ${name}!`,
    type: ValidatorType = ValidatorType.String,
) {
    let chain: ValidationChain
    if (optional) chain = query(name, baseMessage).optional()
    else
        chain = query(name, baseMessage)
            .exists()
            .withMessage(`${name} not given!`)

    chain = applyTypeCheck(chain, type)

    if (type === ValidatorType.String) {
        return chain
            .trim()
            .notEmpty()
            .withMessage(`${name} is empty!`)
            .escape()
    }

    return chain
}
