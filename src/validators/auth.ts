import invalidDomian from "disposable-email-domains"
import { commonBodyValidation } from "./validate"

export function registerUserQueryValidator() {
    return [
        commonBodyValidation("username")
            .isString()
            .isLength({ min: 2, max: 50 })
            .withMessage("Invalid lenght")
            .matches(/^([a-zA-Z._-]+\d*)+$/),

        commonBodyValidation("email").isEmail({
            host_blacklist: invalidDomian,
        }),

        commonBodyValidation("fullName").isString(),

        commonBodyValidation("password")
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 0,
                minNumbers: 1,
                minSymbols: 0,
            })
            .withMessage(
                "Password must contain at least 8 characters, " +
                    "including 1 letter, " +
                    "and 1 number"
            ),
    ]
}

export function loginUserQueryValidator() {
    return [
        commonBodyValidation("username").isString(),

        commonBodyValidation("password").isStrongPassword(),
    ]
}
