import { analyzeDataset } from "../services/uploadService.js";

export const uploadFile = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    const result = await analyzeDataset(req.file.path);

    res.status(200).json(result);
};