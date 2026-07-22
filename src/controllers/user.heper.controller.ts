import crypto from "node:crypto"
import type { IUserDoc } from "../interfaces/user.interface"
import ApiError from "../utils/apiError"
import EmailService from "../utils/sendMail"

export async function setAccessAndRefereshToken(user: IUserDoc) {
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken

    try {
        await user.save()
    } catch (error) {
        throw new ApiError("Unable to login the user", 500, error)
    }

    return { accessToken, refreshToken }
}
export async function sendEmailWithActivationToken(user: IUserDoc) {
    const { token, expiresAt } = await user.generateActivationToken()
    const hasedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("base64url")

    user.activationToken = { token: hasedToken, expiresAt }

    try {
        await user.save()
    } catch (error) {
        throw new ApiError("Unable to generate activation token", 500, error)
    }

    const info = await EmailService.send(user, token)
    console.log("Emailservice Respose: ", info)
}
