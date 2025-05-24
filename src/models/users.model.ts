import bycript from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

interface UserInterface {
    username: string
    fullName: string
    email: string
    password: string
    lastOnline: Date
    profileImageUrl: string
    refreshToken: string
    isAdmin: boolean
    isPasswordMatch: (password: string) => Promise<boolean>
    generateAccessToken: () => Promise<string>
    generateRefreshToken: () => Promise<string>
}

const userSchema = new mongoose.Schema<UserInterface>({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        match: /^([a-zA-Z._-]+\d*)+$/,
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    lastOnline: {
        type: Date,
        default: Date.now,
    },
    profileImageUrl: {
        type: String,
    },
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = await bycript.hash(
        this.password,
        Number(process.env.BYCRIPT_ROUND)
    )
    next()
})

userSchema.methods.isPasswordMatch = async function (password: string) {
    return await bycript.compare(password, this.password)
}
userSchema.methods.generateAccessToken = async function () {
    const expiry = (process.env.JWT_ACCESS_TOKEN_EXPIRY as "") || "1d"
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        process.env.JWT_ACCESS_TOKEN as string,
        {
            expiresIn: expiry,
        }
    )
}
userSchema.methods.generateRefreshToken = async function () {
    const expiry = (process.env.JWT_REFRESH_TOKEN_EXPIRY as "") || "1d"
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_REFRESH_TOKEN as string,
        {
            expiresIn: expiry,
        }
    )
}

export const User = mongoose.model<UserInterface>("User", userSchema)
