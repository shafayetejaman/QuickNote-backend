import { Router } from "express"
import categoryRouter from "./category.router"
import colorRouter from "./color.router"
import noteRouter from "./notes.router"
import tagRouter from "./tag.router"
import userRouter from "./user.router"

const router = Router()

router.use("/v1/users", userRouter)
router.use("/v1/notes", noteRouter)
router.use("/v1/colors", colorRouter)
router.use("/v1/tags", tagRouter)
router.use("/v1/categories", categoryRouter)

export default router
