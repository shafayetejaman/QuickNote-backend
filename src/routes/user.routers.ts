import { Router } from "express"
import {
    getRefreshToken,
    loginUser,
    logoutUser,
    registerUser,
} from "../controllers/user.controller"
import authMiddleware from "../middlewares/auth.middleware"
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
router.route("/login").post(loginUser)

// secure routhes
router.route("/logout").get(authMiddleware, logoutUser)
router.route("/get-refreshToken").get(getRefreshToken)

export default router
