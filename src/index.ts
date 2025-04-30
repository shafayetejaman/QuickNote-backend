import dotenv from "dotenv"
import express, { Express, Request, Response } from "express"
import morgan from "morgan"
import logger from "./logger"

dotenv.config()
const app: Express = express()
const morganFormat: string = ":method :url :status :response-time ms"

// Custom stream type
interface LogObject {
    method: string
    url: string
    status: string
    responseTime: string
}

app.use(
    morgan(morganFormat, {
        stream: {
            write: (message: string): void => {
                const status: string[] = message.split(" ")
                const logObject: LogObject = {
                    method: status[0],
                    url: status[1],
                    status: status[2],
                    responseTime: status[3] + "ms",
                }
                logger.info(JSON.stringify(logObject))
            },
        },
    })
)

app.use(express.json())

app.get("/notes", (request: Request, response: Response): void => {
    // Placeholder for fetching notes logic
    const notes: { id: number; content: string }[] = [
        { id: 1, content: "Note 1" },
        { id: 2, content: "Note 2" },
    ]
    response.json(notes)
})

const PORT: number = parseInt(process.env.PORT as string) || 8000

const server = app.listen(PORT, (): void => {
    const addressInfo = server.address()
    if (typeof addressInfo === "object" && addressInfo !== null) {
        console.log(
            `Server is running at http://${addressInfo.address}:${addressInfo.port}`
        )
    } else {
        console.log(`Server is running on port ${PORT}`)
    }
})
