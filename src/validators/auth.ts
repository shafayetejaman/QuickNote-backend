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

        body("profileImageUrl")
            .optional()
            .isURL()
            .withMessage("Should be URL")
            .escape(),
    ]
}
