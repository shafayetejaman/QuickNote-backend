import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose"
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"

let replSet: MongoMemoryReplSet

process.env.JWT_ACCESS_TOKEN = "test-access-token-secret"
process.env.JWT_REFRESH_TOKEN = "test-refresh-token-secret"
process.env.JWT_ACCESS_TOKEN_EXPIRY = "1h"
process.env.JWT_REFRESH_TOKEN_EXPIRY = "7d"
process.env.BYCRYPT_ROUND = "4"
process.env.FRONTEND_URL = "http://localhost:3000"
process.env.BACKEND_URL = "http://localhost:8000"
process.env.NODE_ENV = "test"

mongoose.plugin((schema: mongoose.Schema) => {
    schema.pre("save", function () {
        const session = (global as any).__testSession
        if (session) this.$session(session)
    })

    schema.pre("validate", function () {
        const session = (global as any).__testSession
        if (session) this.$session(session)
    })

    const queryHooks = [
        "find",
        "findOne",
        "findOneAndUpdate",
        "findOneAndDelete",
        "deleteOne",
        "deleteMany",
    ] as const
    for (const hook of queryHooks) {
        schema.pre(hook, function () {
            const session = (global as any).__testSession
            if (session) this.session(session)
        })
    }
})

beforeAll(async () => {
    replSet = await MongoMemoryReplSet.create({
        replSet: { count: 1, storageEngine: "wiredTiger" },
    })
    const uri = replSet.getUri()
    await mongoose.connect(uri)
})

beforeEach(async () => {
    const session = await mongoose.startSession()
    session.startTransaction()
    ;(global as any).__testSession = session
})

afterEach(async () => {
    const session = (global as any).__testSession as
        | mongoose.ClientSession
        | undefined
    if (session) {
        await session.abortTransaction()
        await session.endSession()
    }
    ;(global as any).__testSession = undefined
})

afterAll(async () => {
    await mongoose.disconnect()
    if (replSet) await replSet.stop()
})
