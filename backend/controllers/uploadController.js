import { processUpload } from "../services/uploadService";

export const uploadFile = (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    const result = processUpload(req.file);

    res.status(200).json(result);
};