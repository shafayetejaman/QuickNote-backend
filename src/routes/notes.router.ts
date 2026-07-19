import { Router } from "express"
import { getAllNotes } from "../controllers/notes.controller"

const router = Router()

router.route("notes").get(getAllNotes)

export default router
