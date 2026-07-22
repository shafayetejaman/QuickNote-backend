import type { HydratedDocument, Types } from "mongoose"

export type INoteDoc = HydratedDocument<INote>

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
