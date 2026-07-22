import { Router } from "express"
import {
    createTag,
    deleteTag,
    getAllTags,
    getTag,
    updateTag,
} from "../controllers/tag.controller"
import authMiddleware from "../middlewares/auth.middleware"
import { isAdmin } from "../middlewares/isAdmin.middleware"
import {
    createTagValidator,
    updateTagValidator,
} from "../validators/tag.validator"
import { validate } from "../validators/validate"

const router = Router()

router.route("/").get(getAllTags)

router.route("/:tagId").get(getTag)

router
    .route("/")
    .post(authMiddleware, isAdmin, createTagValidator(), validate, createTag)

router
    .route("/:tagId")
    .patch(authMiddleware, isAdmin, updateTagValidator(), validate, updateTag)

router.route("/:tagId").delete(authMiddleware, isAdmin, deleteTag)

export default router
