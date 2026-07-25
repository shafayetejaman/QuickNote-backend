import invalidDomian from "disposable-email-domains"
import {
    commonBodyValidator,
    commonQueryValidator,
    ValidatorType,
} from "./commonValidator"

export function registerUserQueryValidator() {
    return [
        commonBodyValidator(
            "username",
            false,
            undefined,
            ValidatorType.String,
        )
            .isLength({ min: 2, max: 50 })
            .withMessage("Invalid lenght"),

        commonBodyValidator(
            "email",
            false,
            undefined,
            ValidatorType.Email,
        ).custom((value) => {
            if (invalidDomian.includes(value)) {
                throw new Error("Disposable email addresses are not allowed")
            }
            return true
        }),

        commonBodyValidator(
            "fullName",
            false,
            undefined,
            ValidatorType.String,
        ),

        commonBodyValidator(
            "password",
            false,
            undefined,
            ValidatorType.String,
        )
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
                    "and 1 number",
            ),
    ]
}

export function loginUserQueryValidator() {
    return [
        commonBodyValidator(
            "username",
            false,
            undefined,
            ValidatorType.String,
        ).isLength({ min: 3, max: 50 }),

        commonBodyValidator(
            "password",
            false,
            undefined,
            ValidatorType.String,
        ).isLength({ min: 8 }),
    ]
}

export function updateUserQueryValidator() {
    return [
        commonBodyValidator(
            "fullName",
            true,
            undefined,
            ValidatorType.String,
        ),

        commonBodyValidator(
            "email",
            true,
            undefined,
            ValidatorType.Email,
        ).custom((value) => {
            if (invalidDomian.includes(value)) {
                throw new Error("Disposable email addresses are not allowed")
            }
            return true
        }),

        commonBodyValidator(
            "password",
            true,
            undefined,
            ValidatorType.String,
        )
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
                    "and 1 number",
            ),

        commonBodyValidator(
            "confPassword",
            true,
            undefined,
            ValidatorType.String,
        ).custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match!")
            }
            return true
        }),
    ]
}

export function activateUserQueryValidator() {
    return [
        commonQueryValidator(
            "userId",
            false,
            "Invalid user ID!",
            ValidatorType.ObjectId,
        ),

        commonQueryValidator(
            "token",
            false,
            undefined,
            ValidatorType.String,
        ).isLength({ min: 10 }),
    ]
}
