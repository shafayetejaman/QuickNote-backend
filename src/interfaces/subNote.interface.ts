import { Types } from "mongoose"

export default interface SubNoteInterface {
    title: string
    body: string
    color: Types.ObjectId
}
