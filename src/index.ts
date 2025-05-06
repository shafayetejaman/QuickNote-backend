import dotenv from "dotenv"
dotenv.config({ path: "./.env" })

import app from "./app"
import dbConnect from "./db/db"

dbConnect()
    .then(function () {
        const PORT: number = parseInt(process.env.PORT as string) || 8000

        const server = app.listen(PORT, (): void => {
            const addressInfo = server.address()
            if (typeof addressInfo === "object" && addressInfo !== null) {
                console.log(
                    `Server is running at http://${addressInfo.address}:${addressInfo.port}`
                )
            }
        })

        app.get("/", function (req, res) {
            res.send("<h1>This is Home</h1>")
        })
    })
    .catch((error) => {
        console.error("error: ", error)
        process.exit(-1)
    })
