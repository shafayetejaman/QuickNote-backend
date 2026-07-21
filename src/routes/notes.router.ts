import { Router } from "express"
import {
    getAllNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
} from "../controllers/notes.controller"
import {
    getSubNotesByNote,
    getSubNote,
    createSubNote,
    updateSubNote,
    deleteSubNote,
} from "../controllers/subNote.controller"
import authMiddleware from "../middlewares/auth.middleware"
import {
    createNoteValidator,
    updateNoteValidator,
    getNoteValidator,
    deleteNoteValidator,
} from "../validators/notes.validator"
import {
    createSubNoteValidator,
    updateSubNoteValidator,
    getSubNoteValidator,
    deleteSubNoteValidator,
} from "../validators/subNote.validator"
import { validate } from "../validators/validate"

const router = Router()

router.use(authMiddleware)

router
    .route("/")
    .get(getAllNotes)
    .post(authMiddleware, createNoteValidator(), validate, createNote)

router
    .route("/:noteId")
    .get(authMiddleware, getNoteValidator(), validate, getNote)
    .patch(authMiddleware, updateNoteValidator(), validate, updateNote)
    .delete(authMiddleware, deleteNoteValidator(), validate, deleteNote)

router
    .route("/:noteId/subnotes")
    .get(authMiddleware, getSubNotesByNote)
    .post(authMiddleware, createSubNoteValidator(), validate, createSubNote)

router
    .route("/:noteId/subnotes/:subNoteId")
    .get(authMiddleware, getSubNoteValidator(), validate, getSubNote)
    .patch(authMiddleware, updateSubNoteValidator(), validate, updateSubNote)
    .delete(authMiddleware, deleteSubNoteValidator(), validate, deleteSubNote)

export default router
