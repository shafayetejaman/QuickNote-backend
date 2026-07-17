export const COOKIE_OPTIONS = {
    // Use security feature only in production
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
}

export const COOKIE_OPTIONS_WITH_PATH = {
    ...COOKIE_OPTIONS,
    path: "/api/v1/users/get-refresh-token",
}

export default {
    LIMIT: "16KB",
    PUBLIC_IMAGE_PATH: "public/temp/",
}

export const DB_CONNECTION_TIMEOUT = 5_000
