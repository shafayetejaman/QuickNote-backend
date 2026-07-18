import invalidDomian from "disposable-email-domains"
import { commonBodyValidator, commonQueryValidator } from "./validate"

export function registerUserQueryValidator() {
    return [
        commonBodyValidator("username")
            .isString()
            .isLength({ min: 2, max: 50 })
            .withMessage("Invalid lenght")
            .matches(/^([a-zA-Z._-]+\d*)+$/),

        commonBodyValidator("email").isEmail({
            host_blacklist: invalidDomian,
        }),

        commonBodyValidator("fullName").isString(),

        commonBodyValidator("password")
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
        commonBodyValidator("username").isString(),

        commonBodyValidator("password").isString(),
    ]
}

export function updateUserQueryValidator() {
    return [
        commonBodyValidator("fullName", true).isString(),

        commonBodyValidator("email", true).isEmail({
            host_blacklist: invalidDomian,
        }),

        commonBodyValidator("password", true)
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

        commonBodyValidator("confPassword", true)
            .isString()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Passwords do not match!")
                }
                return true
            }),
    ]
}

export function activateUserQueryValidator() {
    return [
        commonQueryValidator("userId")
            .isMongoId()
            .withMessage("Invalid user ID!"),

        commonQueryValidator("token").isString().isLength({ min: 10 }),
    ]
}
