import mongoose from "mongoose"

interface ColorInterface {
    colorName: "blue" | "green" | "red"
    hex: "#0000ff" | "#00ff00" | "#ff0000"
}

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
