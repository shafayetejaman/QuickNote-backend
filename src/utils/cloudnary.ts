import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
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
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
            transformation: {
                quality: "auto:low",
            },
        })
        console.log("img url", response.url)

        fs.unlinkSync(filePath)
        return response
    } catch (error) {
        console.error("error fileUploder :", error)
    }
    fs.unlinkSync(filePath)
    return null
}

export default imagefileUploder
