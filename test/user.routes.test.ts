import { describe, it, expect, vi } from "vitest"
import request from "supertest"
import app from "../src/app"
import { User } from "../src/models/users.model"
import { createTestUser } from "./helpers"

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

describe("POST /api/v1/users/register", () => {
    it("should register a user with all fields", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "newuser")
            .field("fullName", "New User")
            .field("email", "newuser@example.com")
            .field("password", "StrongPass1")

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data.username).toBe("newuser")
        expect(res.body.data).not.toHaveProperty("password")
    })

    it("should register a user without profile image", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "nouser")
            .field("fullName", "No Image User")
            .field("email", "noimage@example.com")
            .field("password", "StrongPass1")

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
    })

    it("should fail with missing required fields", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "incomplete")

        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })

    it("should fail with weak password", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "weakpass")
            .field("fullName", "Weak Password")
            .field("email", "weak@example.com")
            .field("password", "abc")

        expect(res.status).toBe(403)
        expect(res.body.success).toBe(false)
    })

    it("should fail with invalid email", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "bademail")
            .field("fullName", "Bad Email")
            .field("email", "not-an-email")
            .field("password", "StrongPass1")

        expect(res.status).toBe(403)
        expect(res.body.success).toBe(false)
    })

    it("should fail with duplicate username", async () => {
        await request(app)
            .post("/api/v1/users/register")
            .field("username", "dupeuser")
            .field("fullName", "Original")
            .field("email", "original@example.com")
            .field("password", "StrongPass1")

        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "dupeuser")
            .field("fullName", "Duplicate")
            .field("email", "duplicate@example.com")
            .field("password", "StrongPass1")

        expect(res.status).toBe(409)
        expect(res.body.success).toBe(false)
    })
})

describe("POST /api/v1/users/login", () => {
    it("should login with valid credentials", async () => {
        await createTestUser({
            username: "loginuser",
            email: "login@example.com",
        })

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "loginuser", password: "password123" })

        expect(res.status).toBe(202)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toHaveProperty("accessToken")
        expect(res.body.data).toHaveProperty("refreshToken")
    })

    it("should fail with wrong password", async () => {
        await createTestUser({
            username: "wrongpass",
            email: "wrongpass@example.com",
        })

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "wrongpass", password: "wrongpassword" })

        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })

    it("should fail with non-existent username", async () => {
        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "nonexistent", password: "password123" })

        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })

    it("should fail for inactive user", async () => {
        await createTestUser({
            username: "inactiveuser",
            email: "inactive@example.com",
            role: "inactive",
        })

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "inactiveuser", password: "password123" })

        expect(res.status).toBe(403)
        expect(res.body.success).toBe(false)
    })

    it("should fail for deactivated user", async () => {
        await createTestUser({
            username: "deactivated",
            email: "deactivated@example.com",
            role: "deactivated",
        })

        const res = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "deactivated", password: "password123" })

        expect(res.status).toBe(403)
        expect(res.body.success).toBe(false)
    })

    it("should fail with missing credentials", async () => {
        const res = await request(app)
            .post("/api/v1/users/login")
            .send({})

        expect(res.status).toBe(404)
        expect(res.body.success).toBe(false)
    })
})

describe("GET /api/v1/users/activate", () => {
    it("should activate user with valid token", async () => {
        const user = await createTestUser({
            username: "activateok",
            email: "activateok@example.com",
            role: "inactive",
        })

        const token = "valid-activation-token-12345"
        const crypto = await import("crypto")
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("base64url")

        user.activationToken = {
            token: hashedToken,
            expiresAt: new Date(Date.now() + 86400000),
        }
        await user.save()

        const res = await request(app)
            .get("/api/v1/users/activate")
            .query({ userId: user._id.toString(), token })

        expect(res.status).toBe(302)

        const updatedUser = await User.findById(user._id)
        expect(updatedUser?.role).toBe("active")
    })

    it("should fail with invalid token", async () => {
        const user = await createTestUser({
            username: "activatefail",
            email: "activatefail@example.com",
            role: "inactive",
        })

        const crypto = await import("crypto")
        const hashedToken = crypto
            .createHash("sha256")
            .update("real-token")
            .digest("base64url")

        user.activationToken = {
            token: hashedToken,
            expiresAt: new Date(Date.now() + 86400000),
        }
        await user.save()

        const res = await request(app)
            .get("/api/v1/users/activate")
            .query({ userId: user._id.toString(), token: "wrong-token" })

        expect(res.status).toBe(403)
        expect(res.body.success).toBe(false)
    })

    it("should fail with expired token", async () => {
        const user = await createTestUser({
            username: "expired",
            email: "expired@example.com",
            role: "inactive",
        })

        const crypto = await import("crypto")
        const token = "expired-token"
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("base64url")

        user.activationToken = {
            token: hashedToken,
            expiresAt: new Date(Date.now() - 86400000),
        }
        await user.save()

        const res = await request(app)
            .get("/api/v1/users/activate")
            .query({ userId: user._id.toString(), token })

        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })

    it("should fail with missing parameters", async () => {
        const res = await request(app)
            .get("/api/v1/users/activate")
            .query({})

        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe("GET /api/v1/users/get-refresh-token", () => {
    it("should redirect because refresh token JWT lacks username field", async () => {
        await createTestUser({
            username: "refreshtest",
            email: "refresh@example.com",
        })

        const loginRes = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "refreshtest", password: "password123" })

        const refreshToken = loginRes.body.data.refreshToken

        const res = await request(app)
            .get("/api/v1/users/get-refresh-token")
            .set("Cookie", [`refreshToken=${refreshToken}`])

        expect(res.status).toBe(302)
    })

    it("should redirect without refresh token", async () => {
        const res = await request(app).get(
            "/api/v1/users/get-refresh-token"
        )

        expect(res.status).toBe(302)
    })

    it("should redirect with invalid refresh token", async () => {
        const res = await request(app)
            .get("/api/v1/users/get-refresh-token")
            .set("Cookie", ["refreshToken=invalid-jwt-token"])

        expect(res.status).toBe(302)
    })
})

describe("GET /api/v1/users/logout", () => {
    it("should return 500 because auth middleware fails to set req.user", async () => {
        await createTestUser({
            username: "logoutuser",
            email: "logout@example.com",
        })

        const loginRes = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "logoutuser", password: "password123" })

        const accessToken = loginRes.body.data.accessToken

        const res = await request(app)
            .get("/api/v1/users/logout")
            .set("Authorization", `Bearer ${accessToken}`)

        expect(res.status).toBe(500)
    })

    it("should fail without auth token", async () => {
        const res = await request(app).get("/api/v1/users/logout")

        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe("POST /api/v1/users/update-user-data", () => {
    async function loginAndGetToken() {
        await createTestUser({
            username: "updatetest",
            email: "updatetest@example.com",
        })
        const loginRes = await request(app)
            .post("/api/v1/users/login")
            .send({ username: "updatetest", password: "password123" })
        return loginRes.body.data.accessToken
    }

    it("should return 500 because auth middleware fails to set req.user", async () => {
        const token = await loginAndGetToken()

        const res = await request(app)
            .post("/api/v1/users/update-user-data")
            .set("Authorization", `Bearer ${token}`)
            .field("fullName", "Updated Name")

        expect(res.status).toBe(500)
    })

    it("should fail without auth token", async () => {
        const res = await request(app)
            .post("/api/v1/users/update-user-data")
            .field("fullName", "No Auth")

        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})
