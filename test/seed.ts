import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import app from "../src/app"

process.env.JWT_ACCESS_TOKEN = "seed-access-token-secret"
process.env.JWT_REFRESH_TOKEN = "seed-refresh-token-secret"
process.env.JWT_ACCESS_TOKEN_EXPIRY = "1h"
process.env.JWT_REFRESH_TOKEN_EXPIRY = "7d"
process.env.BYCRYPT_ROUND = "10"
process.env.FRONTEND_URL = "http://localhost:3000"
process.env.BACKEND_URL = "http://localhost:8000"

async function seed() {
    console.log("Starting in-memory MongoDB replica set...")
    const replSet = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: "wiredTiger" },
    })
    const uri = replSet.getUri()
    await mongoose.connect(uri)
    console.log("Connected to in-memory database.")

    const { User } = await import("../src/models/users.model")
    const { Note } = await import("../src/models/notes.model")
    const { SubNote } = await import("../src/models/subNotes.model")
    const { Color } = await import("../src/models/colors.model")
    const { Tag } = await import("../src/models/tags.model")
    const { Category } = await import("../src/models/categories.model")

    console.log("\nSeeding Users...")
    const admin = await User.create({
        username: "admin",
        fullName: "Admin User",
        email: "admin@example.com",
        password: "admin1234",
        role: "active",
    })
    const regularUser = await User.create({
        username: "johndoe",
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "active",
    })
    console.log(`  Admin: ${admin.id} (admin / admin1234)`)
    console.log(`  User:  ${regularUser.id} (johndoe / password123)`)

    console.log("\nSeeding Colors...")
    const blue = await Color.create({ colorName: "blue", hex: "#0000ff" })
    const green = await Color.create({ colorName: "green", hex: "#00ff00" })
    const red = await Color.create({ colorName: "red", hex: "#ff0000" })
    console.log(`  Blue:   ${blue.id}`)
    console.log(`  Green:  ${green.id}`)
    console.log(`  Red:    ${red.id}`)

    console.log("\nSeeding Categories...")
    const workCat = await Category.create({
        name: "Work",
        categoryIcon: "briefcase",
    })
    const personalCat = await Category.create({
        name: "Personal",
        categoryIcon: "user",
    })
    const ideasCat = await Category.create({
        name: "Ideas",
        categoryIcon: "lightbulb",
    })
    console.log(`  Work:     ${workCat.id}`)
    console.log(`  Personal: ${personalCat.id}`)
    console.log(`  Ideas:    ${ideasCat.id}`)

    console.log("\nSeeding Tags...")
    const importantTag = await Tag.create({
        name: "Important",
        tagIcon: "star",
    })
    const urgentTag = await Tag.create({ name: "Urgent", tagIcon: "zap" })
    const lowPriorityTag = await Tag.create({
        name: "Low Priority",
        tagIcon: "arrow-down",
    })
    const inProgressTag = await Tag.create({
        name: "In Progress",
        tagIcon: "clock",
    })
    const completedTag = await Tag.create({
        name: "Completed",
        tagIcon: "check-circle",
    })
    console.log(`  Important:     ${importantTag.id}`)
    console.log(`  Urgent:        ${urgentTag.id}`)
    console.log(`  Low Priority:  ${lowPriorityTag.id}`)
    console.log(`  In Progress:   ${inProgressTag.id}`)
    console.log(`  Completed:     ${completedTag.id}`)

    console.log("\nSeeding Notes...")
    const note1 = await Note.create({
        user: regularUser.id,
        title: "Project Setup",
        body: "Initialize the repository and set up the project structure.",
        color: blue.id,
        tags: [importantTag.id, inProgressTag.id],
        category: workCat.id,
        remainders: [
            new Date("2026-08-01T09:00:00Z"),
            new Date("2026-08-05T09:00:00Z"),
        ],
    })
    const note2 = await Note.create({
        user: regularUser.id,
        title: "Grocery List",
        body: "Milk, eggs, bread, cheese, vegetables, and fruits.",
        color: green.id,
        tags: [lowPriorityTag.id],
        category: personalCat.id,
    })
    const note3 = await Note.create({
        user: regularUser.id,
        title: "App Feature Ideas",
        body: "Dark mode, push notifications, offline support, export to PDF.",
        color: red.id,
        tags: [importantTag.id, urgentTag.id],
        category: ideasCat.id,
    })
    const note4 = await Note.create({
        user: regularUser.id,
        title: "Meeting Notes",
        body: "Discuss sprint goals, assign tasks, set deadlines for next week.",
        color: blue.id,
        tags: [inProgressTag.id],
        category: workCat.id,
    })
    const note5 = await Note.create({
        user: regularUser.id,
        title: "Workout Plan",
        body: "Monday: chest, Tuesday: back, Wednesday: rest, Thursday: legs.",
        color: green.id,
        tags: [completedTag.id],
        category: personalCat.id,
    })
    console.log(`  Note 1: ${note1.id} - "${note1.title}"`)
    console.log(`  Note 2: ${note2.id} - "${note2.title}"`)
    console.log(`  Note 3: ${note3.id} - "${note3.title}"`)
    console.log(`  Note 4: ${note4.id} - "${note4.title}"`)
    console.log(`  Note 5: ${note5.id} - "${note5.title}"`)

    console.log("\nSeeding SubNotes...")
    const sub1 = await SubNote.create({
        title: "Setup CI/CD",
        body: "Configure GitHub Actions for automated testing and deployment.",
        color: blue.id,
        note: note1.id,
    })
    const sub2 = await SubNote.create({
        title: "Setup Linting",
        body: "Add Biome or ESLint with Prettier for consistent code style.",
        color: blue.id,
        note: note1.id,
    })
    const sub3 = await SubNote.create({
        title: "Dark Mode",
        body: "Add theme toggle in settings, persist preference in localStorage.",
        color: red.id,
        note: note3.id,
    })
    console.log(`  SubNote 1: ${sub1.id} - "${sub1.title}"`)
    console.log(`  SubNote 2: ${sub2.id} - "${sub2.title}"`)
    console.log(`  SubNote 3: ${sub3.id} - "${sub3.title}"`)

    await Note.findByIdAndUpdate(note1.id, {
        $push: { subNotes: { $each: [sub1.id, sub2.id] } },
    })
    await Note.findByIdAndUpdate(note3.id, {
        $push: { subNotes: { $each: [sub3.id] } },
    })

    console.log("\n--- Seed Complete ---")
    console.log(`  Users:     2`)
    console.log(`  Colors:    3`)
    console.log(`  Categories: 3`)
    console.log(`  Tags:      5`)
    console.log(`  Notes:     5`)
    console.log(`  SubNotes:  3`)

    process.env.NODE_ENV = "test"
    const PORT = 8000
    app.listen(PORT, () => {
        console.log(`\nServer running at http://localhost:${PORT}`)
        console.log("Seeded credentials:")
        console.log("  Admin: admin / admin1234")
        console.log("  User:  johndoe / password123")
    })
}

seed().catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
})
