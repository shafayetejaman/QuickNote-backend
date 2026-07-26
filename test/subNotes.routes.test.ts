import request from "supertest"
import { describe, expect, it, vi } from "vitest"
import app from "../src/app"
import { Note } from "../src/models/notes.model"
import { SubNote } from "../src/models/subNotes.model"
import {
    createTestColor,
    createTestNote,
    createTestSubNote,
    createTestUser,
} from "./helpers"

vi.mock("../src/utils/cloudnary", () => ({
    default: vi.fn().mockResolvedValue({
        url: "https://mock-cloudinary.com/image.jpg",
    }),
}))

vi.mock("../src/utils/sendMail", () => ({
    default: {
        send: vi.fn().mockResolvedValue({ messageId: "mock-message-id" }),
    },
}))

async function loginAndGetToken() {
    const user = await createTestUser({
        username: "subnoteuser",
        email: "subnoteuser@example.com",
    })
    const loginRes = await request(app)
        .post("/api/v1/users/login")
        .send({ username: "subnoteuser", password: "password123" })
    return { token: loginRes.body.data.accessToken, userId: user._id.toString() }
}

describe("POST /api/v1/notes/:noteId/subNotes/", () => {
    it("should create a subnote under a note", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const color = await createTestColor()

        const res = await request(app)
            .post(`/api/v1/notes/${note._id.toString()}/subNotes/`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "My SubNote",
                body: "SubNote body",
                color: color._id.toString(),
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toHaveProperty("id")
        expect(typeof res.body.data.id).toBe("string")
        expect(res.body.data).not.toHaveProperty("_id")
        expect(res.body.data).not.toHaveProperty("__v")
        expect(res.body.data.title).toBe("My SubNote")
    })

    it("should add subnote ID to parent note's subNotes array", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const color = await createTestColor()

        await request(app)
            .post(`/api/v1/notes/${note._id.toString()}/subNotes/`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Linked SubNote",
                body: "Body",
                color: color._id.toString(),
            })

        const updatedNote = await Note.findById(note._id)
        expect(updatedNote?.subNotes.length).toBe(1)
    })

    it("should fail when parent note does not exist", async () => {
        const { token } = await loginAndGetToken()
        const color = await createTestColor()
        const fakeNoteId = "507f1f77bcf86cd799439011"

        const res = await request(app)
            .post(`/api/v1/notes/${fakeNoteId}/subNotes/`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Orphan SubNote",
                body: "Body",
                color: color._id.toString(),
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })

    it("should fail with missing required fields", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)

        const res = await request(app)
            .post(`/api/v1/notes/${note._id.toString()}/subNotes/`)
            .set("Authorization", `Bearer ${token}`)
            .send({})

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail with invalid noteId param", async () => {
        const { token } = await loginAndGetToken()
        const color = await createTestColor()

        const res = await request(app)
            .post("/api/v1/notes/not-a-valid-id/subNotes/")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Bad ID SubNote",
                body: "Body",
                color: color._id.toString(),
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail without auth token", async () => {
        const { userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const color = await createTestColor()

        const res = await request(app)
            .post(`/api/v1/notes/${note._id.toString()}/subNotes/`)
            .send({
                title: "No Auth SubNote",
                body: "Body",
                color: color._id.toString(),
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe("PATCH /api/v1/notes/:noteId/subNotes/:subNoteId", () => {
    it("should update a subnote's title", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const subNote = await createTestSubNote(note._id.toString(), {
            title: "Old SubTitle",
        })

        const res = await request(app)
            .patch(
                `/api/v1/notes/${note._id.toString()}/subNotes/${subNote._id.toString()}`,
            )
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "New SubTitle" })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
    })

    it("should fail with invalid subNoteId", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)

        const res = await request(app)
            .patch(
                `/api/v1/notes/${note._id.toString()}/subNotes/not-a-valid-id`,
            )
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Updated" })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should return 404 when subnote does not exist", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const subNote = await createTestSubNote(note._id.toString())
        const subNoteId = subNote._id.toString()
        await SubNote.findByIdAndDelete(subNote._id)

        const res = await request(app)
            .patch(`/api/v1/notes/${note._id.toString()}/subNotes/${subNoteId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Ghost" })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })

    it("should fail without auth token", async () => {
        const { userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const subNote = await createTestSubNote(note._id.toString())

        const res = await request(app)
            .patch(
                `/api/v1/notes/${note._id.toString()}/subNotes/${subNote._id.toString()}`,
            )
            .send({ title: "Hacked" })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe("DELETE /api/v1/notes/:noteId/subNotes/:subNoteId", () => {
    it("should delete a subnote", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const subNote = await createTestSubNote(note._id.toString(), {
            title: "To Delete Sub",
        })

        const res = await request(app)
            .delete(
                `/api/v1/notes/${note._id.toString()}/subNotes/${subNote._id.toString()}`,
            )
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
    })

    it("should remove subnote ID from parent note's subNotes array", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const subNote = await createTestSubNote(note._id.toString())

        await request(app)
            .delete(
                `/api/v1/notes/${note._id.toString()}/subNotes/${subNote._id.toString()}`,
            )
            .set("Authorization", `Bearer ${token}`)

        const updatedNote = await Note.findById(note._id)
        expect(updatedNote?.subNotes.length).toBe(0)
    })

    it("should return 404 when subnote does not exist", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const subNote = await createTestSubNote(note._id.toString())
        const subNoteId = subNote._id.toString()
        await SubNote.findByIdAndDelete(subNote._id)

        const res = await request(app)
            .delete(`/api/v1/notes/${note._id.toString()}/subNotes/${subNoteId}`)
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })

    it("should fail with invalid subNoteId", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)

        const res = await request(app)
            .delete(
                `/api/v1/notes/${note._id.toString()}/subNotes/not-a-valid-id`,
            )
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail without auth token", async () => {
        const { userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const subNote = await createTestSubNote(note._id.toString())

        const res = await request(app).delete(
            `/api/v1/notes/${note._id.toString()}/subNotes/${subNote._id.toString()}`,
        )

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})
