import morgan from "morgan"
import { createLogger, format, transports } from "winston"

const { combine, timestamp, json } = format

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return `${level}: ${message} ${timestamp}`
    })
)

// Create a Winston logger
const logger = createLogger({
    level: "info",
    format: combine(timestamp(), json()), // JSON format for file logs
    transports: [
        new transports.Console({
            format: consoleLogFormat, // Use colorize for console logs
        }),
        new transports.File({
            filename: "app.log",
            format: json(), // Use JSON format for file logs (no colors)
        }),
    ],
})

const morganFormat: string = ":method :url :status :response-time"

// Custom stream type
interface LogObject {
    method: string
    url: string
    status: string
    responseTime: string
}

const formatter = morgan(morganFormat, {
    stream: {
        write: (message: string): void => {
            const status: string[] = message.trim().split(" ")

            // ANSI color codes for console (only for console logging)
            const pink = "\x1b[35m"
            const brightRed = "\x1b[91m"
            const cyan = "\x1b[36m"
            const purple = "\x1b[35m"
            const reset = "\x1b[39m"

            // Apply colors for the console output only
            const coloredMessage = {
                method: `${pink}${status[0]}${reset}`, // Method in Pink
                url: `${cyan}${status[1]}${reset}`, // URL in Cyan
                status: `${purple}${status[2]}${reset}`, // Status in Purple
                responseTime: `${brightRed}${status[3]}ms${reset}`, // Response time in Bright Red
            }

            // Log colored message to the console
            logger.info(
                `${coloredMessage.method} ${coloredMessage.url} ${coloredMessage.status} ${coloredMessage.responseTime}`
            )

            // Save clean JSON log (without color codes) to file
            const logObject: LogObject = {
                method: status[0], // Method without color
                url: status[1], // URL without color
                status: status[2], // Status without color
                responseTime: status[3] + "ms", // Response time without color
            }

            // Log the clean JSON object to the file (no color)
            logger.info(logObject)
        },
    },
})

export default formatter
