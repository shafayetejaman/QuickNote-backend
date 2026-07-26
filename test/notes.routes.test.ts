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
        username: "noteuser",
        email: "noteuser@example.com",
    })
    const loginRes = await request(app)
        .post("/api/v1/users/login")
        .send({ username: "noteuser", password: "password123" })
    return { token: loginRes.body.data.accessToken, userId: user._id.toString() }
}

describe("POST /api/v1/notes/", () => {
    it("should fail without auth token", async () => {
        const color = await createTestColor()

        const res = await request(app)
            .post("/api/v1/notes/")
            .send({
                title: "No Auth Note",
                body: "Body",
                color: color._id.toString(),
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })

    it("should fail with missing required fields", async () => {
        const { token } = await loginAndGetToken()

        const res = await request(app)
            .post("/api/v1/notes/")
            .set("Authorization", `Bearer ${token}`)
            .send({})

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail with missing title", async () => {
        const { token } = await loginAndGetToken()
        const color = await createTestColor()

        const res = await request(app)
            .post("/api/v1/notes/")
            .set("Authorization", `Bearer ${token}`)
            .send({
                body: "Body without title",
                color: color._id.toString(),
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail with invalid color ObjectId", async () => {
        const { token } = await loginAndGetToken()

        const res = await request(app)
            .post("/api/v1/notes/")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Bad Color Note",
                body: "Body",
                color: "not-a-valid-id",
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail with title too short", async () => {
        const { token } = await loginAndGetToken()
        const color = await createTestColor()

        const res = await request(app)
            .post("/api/v1/notes/")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "A",
                body: "Body",
                color: color._id.toString(),
            })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })
})

describe("GET /api/v1/notes/", () => {
    it("should return 200 with an array for authenticated user", async () => {
        const { token, userId } = await loginAndGetToken()
        await createTestNote(userId, { title: "Note One" })
        await createTestNote(userId, { title: "Note Two" })

        const res = await request(app)
            .get("/api/v1/notes/")
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it("should return empty array when user has no notes", async () => {
        const { token } = await loginAndGetToken()

        const res = await request(app)
            .get("/api/v1/notes/")
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBe(0)
    })

    it("should fail without auth token", async () => {
        const res = await request(app).get("/api/v1/notes/")

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe("GET /api/v1/notes/:noteId", () => {
    it("should return 200 for a valid note", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId, { title: "Single Note" })
        await createTestSubNote(note._id.toString(), { title: "Child SubNote" })

        const res = await request(app)
            .get(`/api/v1/notes/${note._id.toString()}`)
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(Array.isArray(res.body.data)).toBe(true)
    })

    it("should fail with invalid noteId", async () => {
        const { token } = await loginAndGetToken()

        const res = await request(app)
            .get("/api/v1/notes/not-a-valid-id")
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail without auth token", async () => {
        const { userId } = await loginAndGetToken()
        const note = await createTestNote(userId)

        const res = await request(app).get(
            `/api/v1/notes/${note._id.toString()}`,
        )

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe("PATCH /api/v1/notes/:noteId", () => {
    it("should fail with invalid noteId", async () => {
        const { token } = await loginAndGetToken()

        const res = await request(app)
            .patch("/api/v1/notes/not-a-valid-id")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Updated" })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail without auth token", async () => {
        const res = await request(app)
            .patch("/api/v1/notes/000000000000000000000000")
            .send({ title: "Hacked" })

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe("DELETE /api/v1/notes/:noteId", () => {
    it("should delete a note", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId, { title: "To Delete" })

        const res = await request(app)
            .delete(`/api/v1/notes/${note._id.toString()}`)
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
    })

    it("should cascade delete subnotes when note is deleted", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId, { title: "Parent Note" })
        const subNote = await createTestSubNote(note._id.toString(), {
            title: "Will Be Deleted",
        })

        await request(app)
            .delete(`/api/v1/notes/${note._id.toString()}`)
            .set("Authorization", `Bearer ${token}`)

        const deletedSubNote = await SubNote.findById(subNote._id)
        expect(deletedSubNote).toBeNull()
    })

    it("should fail with invalid noteId", async () => {
        const { token } = await loginAndGetToken()

        const res = await request(app)
            .delete("/api/v1/notes/not-a-valid-id")
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(422)
        expect(res.body.success).toBe(false)
    })

    it("should fail without auth token", async () => {
        const { userId } = await loginAndGetToken()
        const note = await createTestNote(userId)

        const res = await request(app).delete(
            `/api/v1/notes/${note._id.toString()}`,
        )

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })

    it("should return 404 when note does not exist", async () => {
        const { token, userId } = await loginAndGetToken()
        const note = await createTestNote(userId)
        const noteId = note._id.toString()
        await Note.findByIdAndDelete(note._id)

        const res = await request(app)
            .delete(`/api/v1/notes/${noteId}`)
            .set("Authorization", `Bearer ${token}`)

        expect(typeof res.status).toBe("number")
        expect(typeof res.body.success).toBe("boolean")
        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })
})
