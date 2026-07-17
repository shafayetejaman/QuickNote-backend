import dotenv from "dotenv"
dotenv.config({ path: "./.env" })

import { app } from "./app"
import { dbConnect } from "./db/db"

dbConnect()
    .then(() => {
        console.log("Database connected successfully.")
    })
    .catch((error) => {
        console.error("Database connection error: ", error)
        if (process.env.NODE_ENV !== "production") {
            process.exit(-1)
        }
    })

app.get("/", function (req, res) {
    res.status(200).json({ status: "success", message: "This is Home Backend" })
})

//only run app.listen if we are in a local environment
if (process.env.NODE_ENV !== "production") {
    const PORT: number = parseInt(process.env.PORT as string) || 8000
    const server = app.listen(PORT, (): void => {
        const addressInfo = server.address()
        if (typeof addressInfo === "object" && addressInfo !== null) {
            console.log(
                `Server is running locally at http://localhost:${addressInfo.port}`
            )
        }
    })
}

export default app
