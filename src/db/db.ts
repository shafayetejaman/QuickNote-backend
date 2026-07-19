import mongoose from "mongoose"
import NodeCache from "node-cache"
import { MONGODB_URI } from "../constants"

// 1. Make the global property explicitly required once initialized
declare global {
    var mongooseConnection:
        | {
              conn: typeof mongoose | null
              promise: Promise<typeof mongoose> | null
          }
        | undefined
}

// 2. Initialize the global container first if it doesn't exist
if (!globalThis.mongooseConnection) {
    globalThis.mongooseConnection = { conn: null, promise: null }
}

// 3. Point to the guaranteed global object
const cached = globalThis.mongooseConnection

export async function dbConnect(): Promise<typeof mongoose> {
    if (
        process.env.NODE_ENV === "test" &&
        mongoose.connection.readyState === 1
    ) {
        cached.conn = mongoose
        return mongoose
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
        }

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongooseInstance) => {
                console.log(
                    "DB connected to:",
                    mongooseInstance.connection.host
                )
                return mongooseInstance
            })
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }

    return cached.conn
}

export const userCache = new NodeCache()
