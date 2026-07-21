import { Types } from "mongoose"

export default interface INote {
    user: Types.ObjectId
    title: string
    body: string
    color: Types.ObjectId
    subNotes: Types.ObjectId[]
    tags: Types.ObjectId[]
    category: Types.ObjectId
    remainders: [Date]
}
