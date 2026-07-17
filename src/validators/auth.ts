import { body } from "express-validator"

export function registerUserQueryValidator() {
    return [
        body("username", "Invalid username!")
            .trim()
            .isEmpty()
            .withMessage("username is empty"),
    ]
}
