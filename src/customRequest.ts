import { Request } from "express"
import { Types } from "mongoose"

export interface CustomRequest extends Request {
    user?: {
        _id: Types.ObjectId
        username: string
        fullName: string
        email: string
        password: string
        lastOnline: Date
        profileImageUrl?: string
        refreshToken?: string
        isAdmin: boolean
    }
    files?: {
        profileImage?: Express.Multer.File[]
    }
}
