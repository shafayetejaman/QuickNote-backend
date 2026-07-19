import { Router } from "express"
import userRouter from "./user.router"
import noteRouter from "./notes.router"

const router = Router()

router.use("/v1/users", userRouter)
router.use("/v1/notes", noteRouter)

export default router
