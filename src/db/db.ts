import mongoose from "mongoose"
import createClient from "node-cache"

async function dbConnect() {
    const dbConnection = await mongoose.connect(
        `${process.env.MON_URI}/${process.env.DB_NAME}`
    )
    console.log("DB connect to ", dbConnection.connection.host)
}

const cache = new createClient()

export { cache, dbConnect }
