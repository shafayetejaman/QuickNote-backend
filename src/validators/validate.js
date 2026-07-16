import { validationResult } from "express-validator"

export function validate(req, _res, next) {
    const result = validationResult(req)
    if (result.isEmpty()) {
        next()
    }
    
}
