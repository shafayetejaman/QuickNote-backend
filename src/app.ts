import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import mongoose from "mongoose"
import constants from "./constants"
import { dbConnect } from "./db/db"
import { errorHandler } from "./middlewares/errorHandeler.middleware"
import { formatter } from "./middlewares/logger.middleware"
import router from "./routes/index"
import ApiRespose from "./utils/apiResponse"

// set _id to id for all response
mongoose.plugin((schema) => {
    schema.set("toJSON", {
        transform(_doc, ret: Record<string, unknown>) {
            ret.id = String(ret._id)
            delete ret._id
            delete ret.__v
        },
    })
})

const app = express()

app.get("/", (_req, res) => new ApiRespose("This is Home").send(res))

// middle wares
app.use(compression({ threshold: 0 }))
app.use(express.json({ limit: constants.LIMIT }))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true, limit: constants.LIMIT }))
app.use(formatter)
app.use(cookieParser())
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // allow cookies
    }),
)
// global interceptor middleware runs on Production
app.use(async (_req, _res, next) => {
    try {
        await dbConnect()
        next()
    } catch (error) {
        next(error)
    }
})

app.use("/api", router)
// error middleware for sending error respose to user
app.use(errorHandler)

export default app
