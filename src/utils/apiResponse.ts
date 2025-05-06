class ApiRespose {
    success: boolean

    constructor(
        public statusCode = 200,
        public message = "OK",
        public data = {}
    ) {
        this.success = statusCode < 400
    }
}

export default ApiRespose
