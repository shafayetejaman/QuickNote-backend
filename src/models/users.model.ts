import bycript from "bcrypt"
import crypto from "crypto"
import dayjs from "dayjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

interface UserInterface {
    username: string
    fullName: string
    email: string
    password: string
    lastOnline: Date
    profileImageUrl?: string
    refreshToken?: string
    role: "admin" | "inactive" | "deactivated" | "active"
    activationToken?: { token: string; expiresAt: Date }
    isPasswordMatch: (password: string) => Promise<boolean>
    generateAccessToken: () => Promise<string>
    generateRefreshToken: () => Promise<string>
    generateActivationToken: () => Promise<{
        token: string
        expiresAt: Date
    }>
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
        minlength: 8,
    },
    role: {
        type: String,
        enum: ["admin", "inactive", "deactivated", "active"],
        default: "inactive",
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
    activationToken: {
        type: Object,
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
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
        },
        process.env.JWT_ACCESS_TOKEN as string,
        {
            expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRY as "") || "1s",
        }
    )
}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_REFRESH_TOKEN as string,
        {
            expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRY as "") || "1s",
        }
    )
}
userSchema.methods.generateActivationToken = async function () {
    const token = crypto.randomBytes(32)
    const expiresAt = dayjs().add(1, "day").toDate()
    return { token, expiresAt }
}

export const User = mongoose.model<UserInterface>("User", userSchema)
