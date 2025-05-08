class ApiError extends Error {
    constructor(
        public statusCode = 500,
        public message = "Some Thing Went Wrong!",
        public data: null | object = null,
        public success = false,
        public stack = ""
    ) {
        super(message)
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

export default ApiError
