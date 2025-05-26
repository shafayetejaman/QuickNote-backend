import { Router } from "express"
import {
    activateUser,
    getRefreshToken,
    loginUser,
    logoutUser,
    registerUser,
    updateUser,
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
router.route("/activate").get(activateUser)
router.route("/get-refresh-token").get(getRefreshToken)

// secure routhes
router.route("/logout").get(authMiddleware, logoutUser)
router.route("/update-user-data").post(
    upload.fields([
        {
            name: "profileImage",
            maxCount: 1,
        },
    ]),
    authMiddleware,
    updateUser
)

export default router
