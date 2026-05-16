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
        unique: false, // set true on prouction
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
    profileImageUrl: {
        type: String,
    },
    activationToken: {
        type: Object,
    },
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return

    this.password = await bycript.hash(
        this.password,
        Number(process.env.BYCRYPT_ROUND)
    )
})

userSchema.methods.isPasswordMatch = async function (password: string) {
    return await bycript.compare(password, this.password)
}
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            timeStamp: Date.now(),
            lastOnline: Date.now(),
            role: this.role,
            profileImageUrl: this.profileImageUrl,
        },
        process.env.JWT_ACCESS_TOKEN as string,
        {
            expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRY as "") || "1m",
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
            expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRY as "") || "1m",
        }
    )
}
userSchema.methods.generateActivationToken = async function () {
    const token = crypto.randomBytes(32)
    const hasedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("base64url")

    const expiresAt = dayjs().add(1, "day").toDate()
    return { token: hasedToken, expiresAt }
}

export const User = mongoose.model<UserInterface>("User", userSchema)
