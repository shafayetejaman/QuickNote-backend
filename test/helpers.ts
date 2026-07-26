import { Color } from "../src/models/colors.model"
import { Note } from "../src/models/notes.model"
import { SubNote } from "../src/models/subNotes.model"
import { User } from "../src/models/users.model"

export async function createTestUser(overrides: Record<string, any> = {}) {
    const user = new User({
        username: "testuser",
        fullName: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "active" as const,
        ...overrides,
    })
    await user.save()
    return user
}

export async function createTestColor(
    overrides: Record<string, any> = {},
) {
    const color = new Color({
        colorName: "blue",
        hex: "#0000ff",
        ...overrides,
    })
    await color.save()
    return color
}

export async function createTestNote(
    userId: string,
    overrides: Record<string, any> = {},
) {
    const color = await createTestColor()
    const note = new Note({
        user: userId,
        title: "Test Note",
        body: "Test body",
        color: color._id,
        ...overrides,
    })
    await note.save()
    return note
}

export async function createTestSubNote(
    noteId: string,
    overrides: Record<string, any> = {},
) {
    const color = await createTestColor()
    const subNote = new SubNote({
        title: "Test SubNote",
        body: "Test subnote body",
        color: color._id,
        note: noteId,
        ...overrides,
    })
    await subNote.save()

    await Note.findByIdAndUpdate(noteId, {
        $push: { subNotes: subNote._id },
    })

    return subNote
}
