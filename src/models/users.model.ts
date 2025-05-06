import bycript from "bcrypt"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

interface UserInterface {
    username: string
    fullName: string
    email: string
    password: string
    status: "ONLINE" | "OFFLINE"
    lastOnline: Date
    imageUrl: string
    refreshToken: string
}

const userSchema = new mongoose.Schema<UserInterface>({
    username: {
        type: String,
        unique: true,
        index: true,
        required: true,
        trim: true,
        match: /^([a-z]+\d*)+$/,
        minlength: 5,
        maxlength: 20,
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
    status: {
        type: String,
        enum: ["ONLINE", "OFFLINE"],
        default: "ONLINE",
    },
    refreshToken: {
        type: String,
    },
    lastOnline: {
        type: Date,
        default: Date.now,
    },
    imageUrl: {
        type: String,
    },
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) return next()

    this.password = await bycript.hash(
        this.password,
        parseInt(process.env.BYCRIPT_ROUND as string)
    )
    next()
})

userSchema.methods.isPasswordMatch = async function (password: string) {
    return await bycript.compare(password, this.password)
}
userSchema.methods.generateToken = async function () {
    jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
        },
        process.env.JWT_TOKEN as string,
        {
            expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRY as string),
        }
    )
}
userSchema.methods.generateRefreshToken = async function () {
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_TOKEN as string,
        {
            expiresIn: parseInt(process.env.JWT_TOKEN_EXPIRY as string),
        }
    )
}

export const User = mongoose.model<UserInterface>("User", userSchema)
