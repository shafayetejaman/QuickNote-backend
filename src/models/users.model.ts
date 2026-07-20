import bycript from "bcrypt"
import crypto from "crypto"
import dayjs from "dayjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import UserInterface from "../interfaces/user.interface"

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
        unique: process.env.NODE_ENV === "production", // set true on prouction
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

userSchema.methods.extractData = function () {
    const userData = this.toObject()

    userData.id = userData._id.toString()

    // delete the fields that can not be returned
    delete userData._id
    delete userData.password
    delete userData.refreshToken
    delete userData.activationToken

    return userData
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            id: this._id,
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
            id: this._id,
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
