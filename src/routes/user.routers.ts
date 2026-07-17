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
import {
    activateUserQueryValidator,
    loginUserQueryValidator,
    registerUserQueryValidator,
    updateUserQueryValidator,
} from "../validators/auth"
import { validate } from "../validators/validate"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profileImage",
            maxCount: 1,
        },
    ]),
    registerUserQueryValidator(),
    validate,
    registerUser
)
router.route("/login").post(loginUserQueryValidator(), validate, loginUser)
router.route("/activate").get(activateUserQueryValidator(), validate, activateUser)
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
    updateUserQueryValidator(),
    validate,
    updateUser
)

export default router
