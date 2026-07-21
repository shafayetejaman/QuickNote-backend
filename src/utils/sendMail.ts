import nodemailer, { Transporter } from "nodemailer"
import dotenv from "dotenv"
import { IUserDoc } from "../interfaces/user.interface"
import fs from "fs"
import path from "path"

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

    private getTemplate(data: Record<string, string>): string {
        let file = fs.readFileSync(
            path.join(__dirname, "../templates", "activationEmail.html"),
            "utf8"
        )
        for (const [key, val] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, "g")
            file = file.replace(regex, val)
        }
        return file
    }

    async send(user: IUserDoc, token: string) {
        const data = {
            username: user.username,
            token: `${process.env.BACKEND_URL}/api/v1/users/activate/?userId=${user.id}&token=${token}`,
        }
        const html = this.getTemplate(data)

        const response = await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Activate Your Account",
            html,
        })

        return response
    }
}

export default new EmailService()
