import { Router } from "express"
import {
    createOrUpdateNote,
    deleteNote,
    getAllNotes,
    getNote,
} from "../controllers/notes.controller"
import authMiddleware from "../middlewares/auth.middleware"
import {
    createNoteValidator,
    deleteNoteValidator,
    getNoteValidator,
    updateNoteValidator,
} from "../validators/notes.validator"
import { validate } from "../validators/validate"

const router = Router()

router.use(authMiddleware)

router
    .route("/")
    .get(getAllNotes)
    .post(authMiddleware, createNoteValidator(), validate, createOrUpdateNote)

router
    .route("/:noteId")
    .get(authMiddleware, getNoteValidator(), validate, getNote)
    .patch(authMiddleware, updateNoteValidator(), validate, createOrUpdateNote)
    .delete(authMiddleware, deleteNoteValidator(), validate, deleteNote)

export default router
