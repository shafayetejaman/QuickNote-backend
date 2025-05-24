import { UploadApiResponse } from "cloudinary"
import fs from "fs"
import jwt from "jsonwebtoken"
import { cache } from "../db/db"
import { User } from "../models/users.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import imagefileUploder from "../utils/cloudnary"

const cookieOptions = {
    // Use security feature only in production
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
}

const cookieOptionsWithPath = {
    ...cookieOptions,
    path: "/api/v1/users/get-refreshToken",
}

function extractUserData(user: InstanceType<typeof User>) {
    const userData = {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        lastOnline: user.lastOnline,
        profileImageUrl: user?.profileImageUrl,
        refreshToken: user?.refreshToken,
        isAdmin: user.isAdmin,
    }
    return userData
}

const registerUser = asyncHandler(async (req, res) => {
    const data = req.body

    const user = new User(data)
    const profileImagePath = req.files?.profileImage?.[0]?.path || null

    // chacking for missing fields
    const missingFields = ["username", "fullName", "email", "password"].filter(
        (field) => !data[field]
    )

    if (missingFields.length > 0) {
        if (profileImagePath) fs.unlinkSync(profileImagePath)
        throw new ApiError(400, "Missing some fields", { missingFields })
    }

    // chaking if username and email already exits
    if (
        await User.findOne({
            $or: [{ username: user.username }, { email: user.email }],
        })
    ) {
        if (profileImagePath) fs.unlinkSync(profileImagePath)
        throw new ApiError(409, "Username or Email already taken!")
    }

    // uploading user img to cloudinary
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
    } catch (error) {
        console.error(error)
        throw new ApiError(400, "Invalid Data!")
    }

    // sending successfull
    const { password, refreshToken, ...userData } = user.toObject()

    res.status(201).json(
        new ApiRespose(201, "User created Successfully!", userData)
    )
})

const setAccessAndRefereshToken = async (user: InstanceType<typeof User>) => {
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

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username })

    if (!user || !(await user?.isPasswordMatch(password?.toString()))) {
        throw new ApiError(404, "username or password is incorrect!")
    }

    const { accessToken, refreshToken } = await setAccessAndRefereshToken(user)

    cache.set(username, extractUserData(user))

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
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        { new: true }
    )

    let statusCodoe = 404
    if (!user) {
        throw new ApiError(statusCodoe, "user not found")
    }

    if (cache.has(user.username)) cache.del(user.username)

    statusCodoe = 200
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

    if (!incommingRefreshToken) {
        return redirect()
    }

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

    if (!payload) {
        return redirect()
    }

    const user = await User.findById(payload?._id)

    if (!user) {
        return redirect()
    }

    const { accessToken, refreshToken } = await setAccessAndRefereshToken(user)

    cache.set(user.username, extractUserData(user))

    const statusCodoe = 202
    res.cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", cookieOptionsWithPath)
        .status(statusCodoe)
        .json(
            new ApiRespose(statusCodoe, "User Token refreshed!", {
                accessToken,
                refreshToken,
            })
        )
})

export {
    cookieOptions,
    cookieOptionsWithPath,
    extractUserData,
    getRefreshToken,
    loginUser,
    logoutUser,
    registerUser,
}
