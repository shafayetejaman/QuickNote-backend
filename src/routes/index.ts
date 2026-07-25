import { Router } from "express"
import noteRouter from "./notes.router"
import subNoteRouter from "./subNotes.router"
import userRouter from "./user.router"

const router = Router()

router.use("/v1/users", userRouter)
router.use("/v1/notes", noteRouter)
router.use("/v1/notes/:noteId/subNotes", subNoteRouter)

export default router
