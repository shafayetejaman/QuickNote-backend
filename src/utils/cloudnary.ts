import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import ApiError from "./apiError"
// Configuration

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
// Upload an image
async function imagefileUploder(filePath: string) {
    if (!filePath) return null

    try {
        console.log("uploding to cloudinary..............")
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            transformation: {
                quality: "auto:low",
            },
        })
        console.log("img url", response.url)

        fs.unlink(filePath, (error) => {
            console.error(error)
        })
        return response
    } catch (error) {
        console.error("error fileUploder :", error)
        fs.unlink(filePath, (error) => {
            console.error(error)
        })
        throw new ApiError(500, "Image Upload Field!")
    }
}

export default imagefileUploder
