import * as fs from "fs"

// Function to safely parse JSON
function safeParse(jsonString: string) {
    try {
        return JSON.parse(jsonString)
    } catch {
        return null
    }
}

// Read log file
const data = fs.readFileSync("app.log", "utf8")

// Process each line
data.split("\n").forEach((line) => {
    line = line.trim()
    if (!(line.startsWith("{") && line.endsWith("}"))) return

    const log = safeParse(line)
    if (!log) return

    // Replace escaped \\u001b with real ANSI escape sequences
    const level = log.level.replace(/\\u001b/g, "\x1b")

    const messageJson = safeParse(log.message.replace(/\\\\u001b/g, "\x1b"))
    if (!messageJson) return

    console.log(`timestamp: ${log.timestamp}`)
    console.log(`level: ${level}`)
    console.log(`method: ${messageJson.method}`)
    console.log(`url: ${messageJson.url}`)
    console.log(`status: ${messageJson.status}`)
    console.log(`responseTime: ${messageJson.responseTime}\n`)
})
