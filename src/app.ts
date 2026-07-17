import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import constants from "./constants"
import dbMiddleware from "./middlewares/db.middleware"
import { errorHandler } from "./middlewares/errorHandeler.middleware"
import { formatter } from "./middlewares/logger.middleware"
import ApiRespose from "./utils/apiResponse"

const app = express()

app.get("/", function (_req, res) {
    return new ApiRespose("This is Home").send(res)
})

// middle wares
app.use(compression({ threshold: 0 }))
app.use(express.json({ limit: constants.LIMIT }))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true, limit: constants.LIMIT }))
app.use(formatter)
app.use(cors({ origin: process.env.ORIGIN, credentials: true }))
app.use(cookieParser())
app.use(dbMiddleware)

// router import
import userRouter from "./routes/user.routers"

// routes
app.use("/api/v1/users", userRouter)

// error middleware for sending error respose to user
app.use(errorHandler)

export default app
