import path from "node:path"
import multer from "multer"
import constants from "../constants"

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, constants.PUBLIC_IMAGE_PATH)
    },
    filename: (_req, file, cb) => {
        const newFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        cb(null, newFileName + path.extname(file.originalname))
    },
})

export default multer({ storage: storage })
