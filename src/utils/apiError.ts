export default class ApiError extends Error {
    public cause: unknown = null
    constructor(
        public message = "Some Thing Went Wrong!",
        public statusCode = 500,
        cause: unknown = null,
        public data: null | object = null,
        public success = false,
        public stack = "",
    ) {
        super(message)
        this.cause = cause

        if (!stack) {
            Error.captureStackTrace(this, this.constructor)
        }
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            data: this.data,
        }
    }
}
