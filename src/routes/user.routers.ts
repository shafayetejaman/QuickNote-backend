import { Router } from "express"
import { registerUser } from "../controllers/user.controller"
import upload from "../middlewares/multer.middleware"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profileImage",
            maxCount: 1,
        },
    ]),
    registerUser
)

export default router
