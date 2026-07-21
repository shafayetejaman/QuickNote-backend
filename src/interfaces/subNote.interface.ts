import { Types } from "mongoose"

export default interface ISubNote {
    title: string
    body: string
    color: Types.ObjectId
    note: Types.ObjectId
}
