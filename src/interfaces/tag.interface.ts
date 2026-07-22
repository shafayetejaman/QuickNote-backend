import type { HydratedDocument } from "mongoose"

export type ITagDoc = HydratedDocument<ITag>

export default interface ITag {
    name: string
    tagIcon: string
}
