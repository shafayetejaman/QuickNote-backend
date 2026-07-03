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
