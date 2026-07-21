import { Router } from "express"
import {
    getAllColors,
    getColor,
    createColor,
    updateColor,
    deleteColor,
} from "../controllers/color.controller"
import authMiddleware from "../middlewares/auth.middleware"
import { isAdmin } from "../middlewares/isAdmin.middleware"
import {
    createColorValidator,
    updateColorValidator,
} from "../validators/color.validator"
import { validate } from "../validators/validate"

const router = Router()

router.route("/").get(getAllColors)

router.route("/:colorId").get(getColor)

router
    .route("/")
    .post(authMiddleware, isAdmin, createColorValidator(), validate, createColor)

router
    .route("/:colorId")
    .patch(authMiddleware, isAdmin, updateColorValidator(), validate, updateColor)

router
    .route("/:colorId")
    .delete(authMiddleware, isAdmin, deleteColor)

export default router
