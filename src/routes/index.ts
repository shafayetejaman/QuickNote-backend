import { Router } from "express"
import userRouter from "./user.router"
import noteRouter from "./notes.router"

const router = Router()

router.use("users/", userRouter)
router.use("notes/", noteRouter)

export default router
