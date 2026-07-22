import { Router } from "express"
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    getCategory,
    updateCategory,
} from "../controllers/category.controller"
import authMiddleware from "../middlewares/auth.middleware"
import { isAdmin } from "../middlewares/isAdmin.middleware"
import {
    createCategoryValidator,
    updateCategoryValidator,
} from "../validators/category.validator"
import { validate } from "../validators/validate"

const router = Router()

router.route("/").get(getAllCategories)

router.route("/:categoryId").get(getCategory)

router
    .route("/")
    .post(
        authMiddleware,
        isAdmin,
        createCategoryValidator(),
        validate,
        createCategory,
    )

router
    .route("/:categoryId")
    .patch(
        authMiddleware,
        isAdmin,
        updateCategoryValidator(),
        validate,
        updateCategory,
    )

router.route("/:categoryId").delete(authMiddleware, isAdmin, deleteCategory)

export default router
