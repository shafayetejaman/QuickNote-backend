import { Request } from "express"
import Payload from "./playload.interface"

export default interface CustomRequest extends Request {
    user?: Payload

    files?: {
        profileImage?: Express.Multer.File[]
    }
}
