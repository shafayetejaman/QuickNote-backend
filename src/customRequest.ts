import { Request } from "express"
import { User } from "./models/users.model"

export interface CustomRequest extends Request {
    user?: InstanceType<typeof User>

    files?: {
        profileImage?: Express.Multer.File[]
    }
}
