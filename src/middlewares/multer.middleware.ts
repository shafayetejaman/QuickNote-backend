import multer from "multer"
import path from "path"
import constants from "../constants"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, constants.PUBLIC_IMAGE_PATH)
    },
    filename: function (req, file, cb) {
        const newFileName = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, newFileName + path.extname(file.originalname))
    },
})

export default multer({ storage: storage })
