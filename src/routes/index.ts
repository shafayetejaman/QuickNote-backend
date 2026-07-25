import { Router } from "express"
import noteRouter from "./notes.router"
import userRouter from "./user.router"

const router = Router()

router.use("/v1/users", userRouter)
router.use("/v1/notes", noteRouter)

export default router
