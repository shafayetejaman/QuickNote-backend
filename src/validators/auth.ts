import { body } from "express-validator"
import { commonBodyValidation } from "./validate"

export function registerUserQueryValidator() {
    return [
        commonBodyValidation("username")
            .isString()
            .isLength({ min: 2, max: 50 })
            .withMessage("Invalid lenght")
            .matches(/^([a-zA-Z._-]+\d*)+$/),

        commonBodyValidation("email").isString(),

        commonBodyValidation("fullName").isString(),
        commonBodyValidation("password").isString().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 0,
            minNumbers: 1,
            minSymbols: 0,
        }),

        body("profileImageUrl")
            .optional()
            .isURL()
            .withMessage("Should be URL")
            .escape(),
    ]
}
