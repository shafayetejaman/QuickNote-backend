import { execSync } from "node:child_process"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import app from "../src/app"
import { Category } from "../src/models/categories.model"
import { Color } from "../src/models/colors.model"
import { Note } from "../src/models/notes.model"
import { SubNote } from "../src/models/subNotes.model"
import { Tag } from "../src/models/tags.model"
import { User } from "../src/models/users.model"

process.env.JWT_ACCESS_TOKEN = "seed-access-token-secret"
process.env.JWT_REFRESH_TOKEN = "seed-refresh-token-secret"
process.env.JWT_ACCESS_TOKEN_EXPIRY = "1h"
process.env.JWT_REFRESH_TOKEN_EXPIRY = "7d"
process.env.BYCRYPT_ROUND = "10"
process.env.FRONTEND_URL = "http://localhost:3000"
process.env.BACKEND_URL = "http://localhost:8000"

const IDS = {
    admin: "507f1f77bcf86cd799431111",
    user: "507f1f77bcf86cd799439011",
    blue: "507f1f77bcf86cd799439101",
    green: "507f1f77bcf86cd799439102",
    red: "507f1f77bcf86cd799439103",
    work: "507f1f77bcf86cd799439201",
    personal: "507f1f77bcf86cd799439202",
    ideas: "507f1f77bcf86cd799439203",
    important: "507f1f77bcf86cd799439301",
    urgent: "507f1f77bcf86cd799439302",
    lowPriority: "507f1f77bcf86cd799439303",
    inProgress: "507f1f77bcf86cd799439304",
    completed: "507f1f77bcf86cd799439305",
    note1: "507f1f77bcf86cd799439401",
    note2: "507f1f77bcf86cd799439402",
    note3: "507f1f77bcf86cd799439403",
    note4: "507f1f77bcf86cd799439404",
    note5: "507f1f77bcf86cd799439405",
    sub1: "507f1f77bcf86cd799439501",
    sub2: "507f1f77bcf86cd799439502",
    sub3: "507f1f77bcf86cd799439503",
} as const

function cleanupOrphans() {
    try {
        execSync('pkill -9 -f "mongod.*--replSet testset"', { stdio: "ignore" })
    } catch {}
    try {
        execSync("rm -rf /tmp/mongo-mem-* /tmp/mongodb-*.sock", {
            stdio: "ignore",
        })
    } catch {}
}

cleanupOrphans()

declare global {
    var __mongoReplSet: MongoMemoryReplSet | undefined
}

async function getReplSet(): Promise<MongoMemoryReplSet> {
    if (globalThis.__mongoReplSet) {
        console.log("Reusing existing in-memory MongoDB replica set.")
        return globalThis.__mongoReplSet
    }
    console.log("Starting in-memory MongoDB replica set...")
    const replSet = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: "wiredTiger" },
    })
    globalThis.__mongoReplSet = replSet
    return replSet
}

process.on("exit", () => cleanupOrphans())
process.on("SIGTERM", () => process.exit(0))
process.on("SIGINT", () => process.exit(0))

async function seed() {
    const replSet = await getReplSet()
    const uri = replSet.getUri()
    await mongoose.connect(uri)
    console.log("Connected to in-memory database.")

    console.log("\nSeeding Users...")
    const admin = await User.create({
        _id: new mongoose.Types.ObjectId(IDS.admin),
        username: "admin",
        fullName: "Admin User",
        email: "admin@example.com",
        password: "admin1234",
        role: "active",
    })
    const regularUser = await User.create({
        _id: new mongoose.Types.ObjectId(IDS.user),
        username: "johndoe",
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "active",
    })
    console.log(`  Admin: ${admin.id} (admin / admin1234)`)
    console.log(`  User:  ${regularUser.id} (johndoe / password123)`)

    console.log("\nSeeding Colors...")
    const blue = await Color.create({
        _id: new mongoose.Types.ObjectId(IDS.blue),
        colorName: "blue",
        hex: "#0000ff",
    })
    const green = await Color.create({
        _id: new mongoose.Types.ObjectId(IDS.green),
        colorName: "green",
        hex: "#00ff00",
    })
    const red = await Color.create({
        _id: new mongoose.Types.ObjectId(IDS.red),
        colorName: "red",
        hex: "#ff0000",
    })
    console.log(`  Blue:   ${blue.id}`)
    console.log(`  Green:  ${green.id}`)
    console.log(`  Red:    ${red.id}`)

    console.log("\nSeeding Categories...")
    const workCat = await Category.create({
        _id: new mongoose.Types.ObjectId(IDS.work),
        name: "Work",
        categoryIcon: "briefcase",
    })
    const personalCat = await Category.create({
        _id: new mongoose.Types.ObjectId(IDS.personal),
        name: "Personal",
        categoryIcon: "user",
    })
    const ideasCat = await Category.create({
        _id: new mongoose.Types.ObjectId(IDS.ideas),
        name: "Ideas",
        categoryIcon: "lightbulb",
    })
    console.log(`  Work:     ${workCat.id}`)
    console.log(`  Personal: ${personalCat.id}`)
    console.log(`  Ideas:    ${ideasCat.id}`)

    console.log("\nSeeding Tags...")
    const importantTag = await Tag.create({
        _id: new mongoose.Types.ObjectId(IDS.important),
        name: "Important",
        tagIcon: "star",
    })
    const urgentTag = await Tag.create({
        _id: new mongoose.Types.ObjectId(IDS.urgent),
        name: "Urgent",
        tagIcon: "zap",
    })
    const lowPriorityTag = await Tag.create({
        _id: new mongoose.Types.ObjectId(IDS.lowPriority),
        name: "Low Priority",
        tagIcon: "arrow-down",
    })
    const inProgressTag = await Tag.create({
        _id: new mongoose.Types.ObjectId(IDS.inProgress),
        name: "In Progress",
        tagIcon: "clock",
    })
    const completedTag = await Tag.create({
        _id: new mongoose.Types.ObjectId(IDS.completed),
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
        _id: new mongoose.Types.ObjectId(IDS.note1),
        user: IDS.user,
        title: "Project Setup",
        body: "Initialize the repository and set up the project structure.",
        color: IDS.blue,
        tags: [IDS.important, IDS.inProgress],
        category: IDS.work,
        subNotes: [IDS.sub1, IDS.sub2],
        remainders: [
            new Date("2026-08-01T09:00:00Z"),
            new Date("2026-08-05T09:00:00Z"),
        ],
    })
    const note2 = await Note.create({
        _id: new mongoose.Types.ObjectId(IDS.note2),
        user: IDS.user,
        title: "Grocery List",
        body: "Milk, eggs, bread, cheese, vegetables, and fruits.",
        color: IDS.green,
        tags: [IDS.lowPriority],
        category: IDS.personal,
    })
    const note3 = await Note.create({
        _id: new mongoose.Types.ObjectId(IDS.note3),
        user: IDS.user,
        title: "App Feature Ideas",
        body: "Dark mode, push notifications, offline support, export to PDF.",
        color: IDS.red,
        tags: [IDS.important, IDS.urgent],
        category: IDS.ideas,
        subNotes: [IDS.sub3],
    })
    const note4 = await Note.create({
        _id: new mongoose.Types.ObjectId(IDS.note4),
        user: IDS.user,
        title: "Meeting Notes",
        body: "Discuss sprint goals, assign tasks, set deadlines for next week.",
        color: IDS.blue,
        tags: [IDS.inProgress],
        category: IDS.work,
    })
    const note5 = await Note.create({
        _id: new mongoose.Types.ObjectId(IDS.note5),
        user: IDS.user,
        title: "Workout Plan",
        body: "Monday: chest, Tuesday: back, Wednesday: rest, Thursday: legs.",
        color: IDS.green,
        tags: [IDS.completed],
        category: IDS.personal,
    })
    console.log(`  Note 1: ${note1.id} - "${note1.title}"`)
    console.log(`  Note 2: ${note2.id} - "${note2.title}"`)
    console.log(`  Note 3: ${note3.id} - "${note3.title}"`)
    console.log(`  Note 4: ${note4.id} - "${note4.title}"`)
    console.log(`  Note 5: ${note5.id} - "${note5.title}"`)

    console.log("\nSeeding SubNotes...")
    const sub1 = await SubNote.create({
        _id: new mongoose.Types.ObjectId(IDS.sub1),
        title: "Setup CI/CD",
        body: "Configure GitHub Actions for automated testing and deployment.",
        color: IDS.blue,
        note: IDS.note1,
    })
    const sub2 = await SubNote.create({
        _id: new mongoose.Types.ObjectId(IDS.sub2),
        title: "Setup Linting",
        body: "Add Biome or ESLint with Prettier for consistent code style.",
        color: IDS.blue,
        note: IDS.note1,
    })
    const sub3 = await SubNote.create({
        _id: new mongoose.Types.ObjectId(IDS.sub3),
        title: "Dark Mode",
        body: "Add theme toggle in settings, persist preference in localStorage.",
        color: IDS.red,
        note: IDS.note3,
    })
    console.log(`  SubNote 1: ${sub1.id} - "${sub1.title}"`)
    console.log(`  SubNote 2: ${sub2.id} - "${sub2.title}"`)
    console.log(`  SubNote 3: ${sub3.id} - "${sub3.title}"`)

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

seed().catch(async (err) => {
    console.error("Seed failed:", err)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
})
