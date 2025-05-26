import crypto from "crypto"
import invalidDomian from "disposable-email-domains"
import validator from "validator"
import { User } from "../models/users.model"
import ApiError from "../utils/apiError"

const cookieOptions = {
    // Use security feature only in production
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
}

const cookieOptionsWithPath = {
    ...cookieOptions,
    path: "/api/v1/users/get-refresh-token",
}

function validateUserData(
    password: string | null = null,
    email: string | null = null
) {
    let isStrongPassword: boolean | null = null
    let isValidEmail: boolean | null = null

    if (password) {
        isStrongPassword = validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
        })
    }
    if (email) {
        isValidEmail =
            validator.isEmail(email) &&
            !invalidDomian.includes(email.split("@")[1])
    }

    return { isStrongPassword, isValidEmail }
}
async function setAccessAndRefereshToken(user: InstanceType<typeof User>) {
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken

    try {
        await user.save()
    } catch (error) {
        console.error(error)
        throw new ApiError(500, "Unable to login the user")
    }

    return { accessToken, refreshToken }
}
async function sendEmailWithActivationToken(user: InstanceType<typeof User>) {
    const { token, expiresAt } = await user.generateActivationToken()
    const hasedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("base64url")

    user.activationToken = { token: hasedToken, expiresAt }
}

function extractUserData(user: InstanceType<typeof User>) {
    const { password, refreshToken, activationToken, ...userData } =
        user.toObject()

    return userData
}

export {
    cookieOptions,
    cookieOptionsWithPath,
    extractUserData,
    sendEmailWithActivationToken,
    setAccessAndRefereshToken,
    validateUserData,
}
