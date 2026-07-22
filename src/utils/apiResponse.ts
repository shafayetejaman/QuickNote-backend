import type { Response } from "express"

export default class ApiRespose {
    success: boolean

    constructor(
        public message = "OK",
        public statusCode = 200,
        public data = {},
    ) {
        this.success = statusCode < 400
    }

    send(res: Response) {
        res.status(this.statusCode).json({
            message: this.message,
            success: this.success,
            data: this.data,
        })
    }
}
