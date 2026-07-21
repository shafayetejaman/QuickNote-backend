import { HydratedDocument } from "mongoose"

export type IColorDoc = HydratedDocument<IColor>

export default interface IColor {
    colorName: "blue" | "green" | "red"
    hex: "#0000ff" | "#00ff00" | "#ff0000"
}
