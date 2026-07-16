import { Payload } from "../interfaces/customPlayload"

export function validateJwtField(payload: unknown): payload is Payload {
    if (!payload) return false
    if (typeof payload !== "object") return false

    const _payload = payload as Record<string, unknown>

    if (_payload.profileImageUrl) {
        if (typeof _payload.profileImageUrl !== "string") return false
    }

    const keys = Object.keys(_payload)
    const pKeys = ["_id", "username", "timeStamp", "role"]

    for (const key of keys) {
        if (!pKeys.includes(key)) return false
    }

    return (
        typeof _payload._id === "string" &&
        typeof _payload.username === "string" &&
        typeof _payload.timeStamp === "number" &&
        typeof _payload.role === "string"
    )
}
