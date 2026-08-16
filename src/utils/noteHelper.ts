import type { INoteDoc } from "../interfaces/note.interface"
import { Note } from "../models/notes.model"

export function generateNoteWithTitle(note: INoteDoc | null) {
    const newNote = new Note()
    if (!note) return newNote

    let num = 0
    const title = note.title
    const pos = title.lastIndexOf("--")

    if (pos !== -1) {
        try {
            num += parseInt(title.slice(pos + 2, title.length), 10)
        } catch {
            num = 0
        }
    }
    newNote.title = note.title + (num > 0) ? `--${num.toString()}` : ""

    return newNote
}
