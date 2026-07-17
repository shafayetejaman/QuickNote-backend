import mongoose from "mongoose"
import createClient from "node-cache"

export async function dbConnect() {
    const dbConnection = await mongoose.connect(
        `${process.env.MON_URI}/${process.env.DB_NAME}`
    )
    console.log("DB connect to ", dbConnection.connection.host)
}

export const dbClient = new createClient()
