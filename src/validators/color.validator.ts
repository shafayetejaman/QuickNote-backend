import { commonBodyValidator } from "./commonValidator"
import { param } from "express-validator"

export function createColorValidator() {
    return [
        commonBodyValidator("colorName")
            .isString()
            .isIn(["blue", "green", "red"])
            .withMessage("Color name must be one of: blue, green, red"),

        commonBodyValidator("hex")
            .isString()
            .isIn(["#0000ff", "#00ff00", "#ff0000"])
            .withMessage("Hex must be one of: #0000ff, #00ff00, #ff0000"),
    ]
}

export function updateColorValidator() {
    return [
        param("colorId").isMongoId().withMessage("Invalid color ID!"),

        commonBodyValidator("colorName", true)
            .isString()
            .isIn(["blue", "green", "red"])
            .withMessage("Color name must be one of: blue, green, red"),

        commonBodyValidator("hex", true)
            .isString()
            .isIn(["#0000ff", "#00ff00", "#ff0000"])
            .withMessage("Hex must be one of: #0000ff, #00ff00, #ff0000"),
    ]
}

export function getColorValidator() {
    return [param("colorId").isMongoId().withMessage("Invalid color ID!")]
}

export function deleteColorValidator() {
    return [param("colorId").isMongoId().withMessage("Invalid color ID!")]
}
