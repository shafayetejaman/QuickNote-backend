import type { Request } from "express"
import type IPayload from "./playload.interface"

export default interface ICustomRequest extends Request {
    user?: IPayload

    files?: {
        profileImage?: Express.Multer.File[]
    }
}
