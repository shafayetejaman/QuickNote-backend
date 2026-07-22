import type { HydratedDocument, Types } from "mongoose"

export type ISubNoteDoc = HydratedDocument<ISubNote>

export default interface ISubNote {
    title: string
    body: string
    color: Types.ObjectId
    note: Types.ObjectId
}
