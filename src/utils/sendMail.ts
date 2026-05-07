import nodemailer, { Transporter } from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

class EmailService {
    private transporter: Transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
    }
}

export default new EmailService()
