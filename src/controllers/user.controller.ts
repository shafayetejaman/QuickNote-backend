import { UploadApiResponse } from "cloudinary"
import { Request } from "express"
import fs from "fs"
import { User } from "../models/users.model"
import ApiError from "../utils/apiError"
import ApiRespose from "../utils/apiResponse"
import asyncHandler from "../utils/asyncHandeler"
import imagefileUploder from "../utils/cloudnary"

interface MulterRequest extends Request {
    files: {
        profileImage: Express.Multer.File[]
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const data = req.body

    const user = new User(data)
    const profileImagePath =
        (req as MulterRequest).files?.profileImage?.[0]?.path || null
    let statusCode: number

    // chacking for missing fields
    const missingFields = ["username", "fullName", "email", "password"].filter(
        (field) => !data[field]
    )

    if (missingFields.length > 0) {
        statusCode = 400
        if (profileImagePath) fs.unlinkSync(profileImagePath)

        return res.status(statusCode).json(
            new ApiError(statusCode, "Missing some fields", {
                missingFields,
            })
        )
    }

    // chaking if username and email already exits
    if (
        await User.findOne({
            $or: [{ username: user.username }, { email: user.email }],
        })
    ) {
        statusCode = 409
        if (profileImagePath) fs.unlinkSync(profileImagePath)
        return res
            .status(statusCode)
            .json(new ApiError(statusCode, "Username or Emial already taken!"))
    }

    // uploading user img to cloudinary
    let cloudinaryRespose: UploadApiResponse | null = null
    if (profileImagePath) {
        cloudinaryRespose = await imagefileUploder(profileImagePath)
    }

    // add extra fields
    user.imageUrl = cloudinaryRespose?.url || ""
    user.refreshToken = ""

    // validating the given data
    try {
        await user.save() // Trying to create the user on the database
        if (profileImagePath) fs.unlinkSync(profileImagePath)
    } catch (error) {
        console.error(error)
        statusCode = 400
        return res
            .status(statusCode)
            .json(new ApiError(statusCode, "Invalid Data!"))
    }

    // sending successfull response
    statusCode = 201
    res.status(statusCode).json(
        new ApiRespose(statusCode, "User created Successfully!", user)
    )
})

export { registerUser }
