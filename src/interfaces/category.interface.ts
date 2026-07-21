import { HydratedDocument } from "mongoose"

export type ICategoryDoc = HydratedDocument<ICategory>

export default interface ICategory {
    name: string
    categoryIcon: string
}
