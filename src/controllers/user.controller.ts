import { UploadApiResponse } from "cloudinary"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import { mongo } from "mongoose"
import { userCache } from "../db/db"
import { Payload } from "../interfaces/customPlayload"
import { User } from "../models/users.model"

type UserDoc = InstanceType<typeof User>
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import imagefileUploder from "../utils/cloudnary"
import {
    sendEmailWithActivationToken,
    setAccessAndRefereshToken,
} from "./user.heper.controller"
import { COOKIE_OPTIONS, COOKIE_OPTIONS_WITH_PATH } from "../constants"

export const registerUser = asyncHandler(async (req, res) => {
    const data = req.body

    const profileImagePath = req.files?.profileImage?.[0]?.path || null
    const user = new User(data)

    let cloudinaryRespose: UploadApiResponse | null = null
    if (profileImagePath) {
        cloudinaryRespose = await imagefileUploder(profileImagePath)
        console.log("upload completed")
    }

    // add extra fields
    if (cloudinaryRespose?.url) user.profileImageUrl = cloudinaryRespose.url

    // validating the given data
    try {
        await user.save() // Trying to create the user on the database
        // genrerate token and store it to the DB and send to user via email
        await sendEmailWithActivationToken(user)
    } catch (error) {
        if (error instanceof mongo.MongoServerError && error.code === 11000) {
            throw new ApiError("Dublicate Email or Username", 409, error)
        }
        throw new ApiError("Unable to create the user profile!", 400, error)
    }

    // sending successfull
    return new ApiRespose(
        "User created Successfully!",
        201,
        user.extractData()
    ).send(res)
})

export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username })

    if (!user || !(await user?.isPasswordMatch(password))) {
        throw new ApiError("username or password is incorrect!", 404)
    }
    // making sure the user valid for login
    if (user.role === "inactive") {
        throw new ApiError("user needs to be acctivated before login!", 403)
    }
    if (user.role === "deactivated") {
        throw new ApiError("user has been diactivated", 403)
    }

    const { accessToken, refreshToken } = await setAccessAndRefereshToken(user)

    userCache.set(user.id, user)

    const statusCode = 202
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS).cookie(
        "refreshToken",
        refreshToken,
        COOKIE_OPTIONS_WITH_PATH
    )

    return new ApiRespose("user logged in!", statusCode, {
        accessToken,
        refreshToken,
        user: user.extractData(),
    }).send(res)
})

export const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError()

    const user = (userCache.get(req.user.id) as UserDoc) || (await User.findById(req.user.id))
    if (!user) throw new ApiError("Unable to find user", 500)

    userCache.del(req.user.id)
    user.refreshToken = undefined

    await user.save()

    res.clearCookie("accessToken", COOKIE_OPTIONS).clearCookie(
        "refreshToken",
        COOKIE_OPTIONS_WITH_PATH
    )

    return new ApiRespose("user logged out!").send(res)
})

export const getRefreshToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken =
        req.cookies.refreshToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!incommingRefreshToken) throw new ApiError("Refresh token needed!", 403)

    let payload
    try {
        payload = jwt.verify(
            incommingRefreshToken,
            process.env.JWT_REFRESH_TOKEN as string
        ) as Payload
    } catch (error) {
        throw new ApiError("Refresh token invalid!", 403, error)
    }

    const user = (userCache.get(payload.id) as UserDoc) || (await User.findById(payload.id))
    if (!user) throw new ApiError("Refresh token invalid!", 403)

    const { accessToken, refreshToken } = await setAccessAndRefereshToken(user)

    userCache.set(user.id, user)

    const statusCodoe = 202
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS).cookie(
        "refreshToken",
        refreshToken,
        COOKIE_OPTIONS_WITH_PATH
    )

    return new ApiRespose("User Token refreshed!", statusCodoe, {
        accessToken,
        refreshToken,
    }).send(res)
})

export const updateUser = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError()

    const user = (userCache.get(req.user.id) as UserDoc) || (await User.findById(req.user.id))
    if (!user) throw new ApiError("Unable to find user", 500)

    const { fullName, email, password, confPassword } = req.body
    const profileImagePath = req.files?.profileImage?.[0]?.path

    if (password && confPassword) {
        user.password = password
    }

    if (email) {
        user.email = email
    }

    if (fullName) {
        user.fullName = fullName
    }

    // uploading img to cloud
    let cloudinaryRespose: UploadApiResponse | null = null
    if (profileImagePath) {
        cloudinaryRespose = await imagefileUploder(profileImagePath)
        console.log("upload completed")
    }

    // add extra fields
    if (cloudinaryRespose?.url) req.user.profileImageUrl = cloudinaryRespose.url

    // validating the given data
    try {
        await user.save()
    } catch (error) {
        if (error instanceof mongo.MongoServerError && error.code === 11000) {
            throw new ApiError("Dublicate Email", 409, error)
        }

        throw new ApiError("Unable to update the user profile!", 400, error)
    }

    userCache.set(user.id, user)

    // sending successfull
    return new ApiRespose(
        "User Updated Successfully!",
        201,
        user.extractData()
    ).send(res)
})

export const activateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.query.userId)
    if (!user) throw new ApiError("invalid user id", 401)

    if (!user?.activationToken || user.activationToken.expiresAt < new Date()) {
        throw new ApiError("Activation token not found or expired!", 401)
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(req.query.token as string)
        .digest("base64url")

    if (hashedToken !== user.activationToken.token) {
        throw new ApiError("invalid token!", 403)
    }

    user.role = "active"
    user.activationToken = undefined

    await user.save()

    return res.redirect(`${process.env.FRONTEND_URL}/login`)
})
