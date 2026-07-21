import { Request } from "express"
import IPayload from "./playload.interface"

export default interface ICustomRequest extends Request {
    user?: IPayload

    files?: {
        profileImage?: Express.Multer.File[]
    }

}
