import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import constants from "./constants"
import { dbConnect } from "./db/db"
import { errorHandler } from "./middlewares/errorHandeler.middleware"
import { formatter } from "./middlewares/logger.middleware"

const app = express()

// middle wares
app.use(compression({ threshold: 0 }))
app.use(express.json({ limit: constants.LIMIT }))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true, limit: constants.LIMIT }))
app.use(formatter)
app.use(cors({ origin: process.env.ORIGIN, credentials: true }))
app.use(cookieParser())

// DB connection middleware — connects lazily on first request
let dbPromise: Promise<void> | null = null
app.use(async (_req, res, next) => {
    if (!dbPromise) {
        dbPromise = dbConnect().catch((err) => {
            console.error("DB connection failed:", err)
            dbPromise = null
        })
    }
    try {
        await dbPromise
    } catch {
        res.status(503).json({
            status: "error",
            message: "Database unavailable",
        })
        return
    }
    next()
})

// router import
import { router as userRouter } from "./routes/user.routers"

// routes
app.get("/", function (_req, res) {
    res.status(200).json({ status: "success", message: "This is Home Backend" })
})

app.use("/api/v1/users", userRouter)

// error middleware for sending error respose to user
app.use(errorHandler)

export default app
