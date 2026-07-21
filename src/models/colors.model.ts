import mongoose from "mongoose"
import IColor from "../interfaces/color.interface"

const colorSchema = new mongoose.Schema<IColor>({
    colorName: {
        type: String,
        enum: ["blue", "green", "red"],
        required: true,
    },
    hex: {
        type: String,
        enum: ["#0000ff", "#00ff00", "#ff0000"],
        required: true,
    },
})

export const Color = mongoose.model<IColor>("Color", colorSchema)
