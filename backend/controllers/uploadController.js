import { analyzeDataset } from "../services/uploadService.js";

export const uploadFile = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    try {
        const result = await analyzeDataset(req.file.path);

        res.status(200).json({
            ...result,
            uploadedFilePath: req.file.path,
            savedFileName: req.file.filename
        });
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ success: false, message: error.toString() || "Unknown error during Python execution." });
    }
};