import { Router } from "express"
import {
    createSubNote,
    deleteSubNote,
    updateSubNote,
} from "../controllers/subNotes.controller"
import authMiddleware from "../middlewares/auth.middleware"
import {
    createSubNoteValidator,
    deleteSubNoteValidator,
    updateSubNoteValidator,
} from "../validators/subNotes.validator"
import { validate } from "../validators/validate"

const router = Router({ mergeParams: true })

router.use(authMiddleware)

router.route("/").post(createSubNoteValidator(), validate, createSubNote)

router
    .route("/:subNoteId")
    .patch(updateSubNoteValidator(), validate, updateSubNote)
    .delete(deleteSubNoteValidator(), validate, deleteSubNote)

export default router
