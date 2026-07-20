import mongoose from "mongoose"
import ColorInterface from "../interfaces/color.interface"

const colorSchema = new mongoose.Schema<ColorInterface>({
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

export const Color = mongoose.model<ColorInterface>("Color", colorSchema)
