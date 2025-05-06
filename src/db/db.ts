import mongoose from "mongoose"

async function dbConnect() {
    const dbConnection = await mongoose.connect(
        `${process.env.MON_URI}/${process.env.DB_NAME}`
    )
    console.log("DB connect to ", dbConnection.connection.host)
}

export default dbConnect
