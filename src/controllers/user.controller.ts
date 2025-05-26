import { UploadApiResponse } from "cloudinary"
import crypto from "crypto"
import fs from "fs"
import jwt from "jsonwebtoken"
import { mongo } from "mongoose"
import { cache } from "../db/db"
import { User } from "../models/users.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import imagefileUploder from "../utils/cloudnary"
import {
    cookieOptions,
    cookieOptionsWithPath,
    extractUserData,
    sendEmailWithActivationToken,
    setAccessAndRefereshToken,
    validateUserData,
} from "./user.heper.controller"

const registerUser = asyncHandler(async (req, res) => {
    const data = req.body

    const user = new User(data)
    const profileImagePath = req.files?.profileImage?.[0]?.path || null

    // chacking for missing fields
    const missingFields = ["username", "fullName", "email", "password"].filter(
        (field) => !data[field]
    )

    if (missingFields.length > 0) {
        if (profileImagePath) {
            fs.unlink(profileImagePath, (error) => {
                console.log(error)
            })
        }
        throw new ApiError(400, "Missing some fields", { missingFields })
    }

    const { isStrongPassword, isValidEmail } = validateUserData(
        req.body.password,
        req.body.email
    )

    if (!isStrongPassword) {
        throw new ApiError(
            403,
            `Password must contain at least 8 characters,` +
                `including 1 uppercase letter,` +
                `1 lowercase letter, and 1 number`
        )
    }

    if (!isValidEmail) throw new ApiError(403, "Invalid Email!")

    let cloudinaryRespose: UploadApiResponse | null = null
    if (profileImagePath) {
        cloudinaryRespose = await imagefileUploder(profileImagePath)
        console.log("upload completed")
    }

    // add extra fields
    if (cloudinaryRespose?.url) user.profileImageUrl = cloudinaryRespose.url

    // genrerate token and store it to the DB and send to user via email
    await sendEmailWithActivationToken(user)

    // validating the given data
    try {
        await user.save() // Trying to create the user on the database
    } catch (error) {
        console.error(error)
        if (error instanceof mongo.MongoServerError && error.code === 11000) {
            throw new ApiError(409, "Dublicate Email or Username")
        }
        throw new ApiError(400, "Unable to create the user profile!")
    }

    // sending successfull
    res.status(201).json(
        new ApiRespose(201, "User created Successfully!", extractUserData(user))
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username })

    if (!user || !(await user?.isPasswordMatch(password))) {
        throw new ApiError(404, "username or password is incorrect!")
    }
    // making sure the user valid for login
    if (user.role === "inactive") {
        throw new ApiError(403, "user needs to be acctivated before login!")
    }
    if (user.role === "deactivated") {
        throw new ApiError(403, "user has been diactivated")
    }

    const { accessToken, refreshToken } = await setAccessAndRefereshToken(user)

    cache.set(username, user)

    const statusCodoe = 202
    res.cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptionsWithPath)
        .status(statusCodoe)
        .json(
            new ApiRespose(statusCodoe, "user logged in!", {
                accessToken,
                refreshToken,
            })
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError()

    cache.del(req.user.username)
    req.user.refreshToken = undefined

    try {
        await req.user.save()
    } catch (error) {
        console.error(error)
        throw new ApiError(500, "Unable to logout user!")
    }

    const statusCodoe = 200
    res.clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptionsWithPath)
        .status(statusCodoe)
        .json(new ApiRespose(statusCodoe, "user logged out!"))
})

const getRefreshToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken =
        req.cookies.refreshToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    const redirect = () => res.redirect(process.env.FRONTEND_ADDRESS + "/login")

    if (!incommingRefreshToken) return redirect()

    let payload = null
    try {
        payload = jwt.verify(
            incommingRefreshToken,
            process.env.JWT_REFRESH_TOKEN as string
        ) as { _id?: string }
    } catch (error) {
        console.error(error)
        return redirect()
    }

    if (!payload) return redirect()

    const user = await User.findById(payload?._id)

    if (!user) return redirect()

    const { accessToken, refreshToken } = await setAccessAndRefereshToken(user)

    cache.set(user.username, user)

    const statusCodoe = 202
    res.cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptionsWithPath)
        .status(statusCodoe)
        .json(
            new ApiRespose(statusCodoe, "User Token refreshed!", {
                accessToken,
                refreshToken,
            })
        )
})

const updateUser = asyncHandler(async (req, res) => {
    if (!req.user) throw new ApiError()

    const { fullName, email, password, confPassword } = req.body
    const profileImagePath = req.files?.profileImage?.[0]?.path

    if (password && confPassword) {
        if (password !== confPassword) {
            throw new ApiError(403, "Password did not match!")
        }

        const { isStrongPassword } = validateUserData(password)

        if (!isStrongPassword) {
            throw new ApiError(
                403,
                `Password must contain at least 8 characters,` +
                    `including 1 uppercase letter, ` +
                    `1 lowercase letter, and 1 number`
            )
        }

        req.user.password = password
        await req.user.validate(["password"])
    }

    if (email) {
        const { isValidEmail } = validateUserData(null, email)
        if (!isValidEmail) throw new ApiError(403, "Invalid Email!")

        req.user.email = email
        await req.user.validate(["email"])
    }

    if (fullName) {
        req.user.fullName = fullName
        await req.user.validate(["fullName"])
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
        await req.user.save({ validateBeforeSave: false }) // update user
    } catch (error) {
        console.error(error)
        if (error instanceof mongo.MongoServerError && error.code === 11000) {
            throw new ApiError(409, "Dublicate Email")
        }

        throw new ApiError(400, "Unable to update the user profile!")
    }
    // sending successfull

    res.status(201).json(
        new ApiRespose(
            201,
            "User Updated Successfully!",
            extractUserData(req.user)
        )
    )
})

const activateUser = asyncHandler(async (req, res) => {
    let statusCode = 401
    let user: InstanceType<typeof User> | null = null

    if (!(req.query.user && req.query.token)) {
        throw new ApiError(statusCode, "Activation token and user ID required")
    }

    try {
        user = await User.findById(req.query.userId)
    } catch (error) {
        console.error(error)
        throw new ApiError(statusCode, "invalid user id")
    }

    if (!user?.activationToken || user.activationToken.expiresAt < new Date()) {
        throw new ApiError(statusCode, "Activation token not found or expired!")
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(req.query.token as string)
        .digest("base64url")

    if (hashedToken !== user.activationToken.token) {
        throw new ApiError(403, "invalid token!")
    }

    user.role = "active"
    user.activationToken = undefined
    try {
        await user.save()
    } catch (error) {
        console.error(error)
        throw new ApiError(500, "unable to activate the user")
    }

    statusCode = 200
    res.status(statusCode).json(
        new ApiRespose(statusCode, "user activated successfully")
    )
})

export {
    activateUser,
    cookieOptions,
    cookieOptionsWithPath,
    getRefreshToken,
    loginUser,
    logoutUser,
    registerUser,
    updateUser,
}
