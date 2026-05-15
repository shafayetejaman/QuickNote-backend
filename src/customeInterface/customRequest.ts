import { Request } from "express"
import { Payload } from "./customPlayload"

export interface CustomRequest extends Request {
    user?: Payload

    files?: {
        profileImage?: Express.Multer.File[]
    }
}
