import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import constants from "./constants"
import formatter from "./middlewares/logger.middleware"

const app = express()

// middle wares
app.use(express.json({ limit: constants.LIMIT }))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true, limit: constants.LIMIT }))
app.use(formatter)
app.use(cors({ origin: process.env.ORIGIN, credentials: true }))
app.use(cookieParser())

// router import
import userRouter from "./routes/user.routers"

// routes
app.use("/api/v1/users", userRouter)

export default app
