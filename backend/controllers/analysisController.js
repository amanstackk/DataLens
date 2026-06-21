import { getHealthData } from "../services/analysisService.js";
import { runMlPython } from "../services/pythonService.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getHealthStatus = (req, res) => {
    const data = getHealthData();
    res.json(data);
};

export const runMlAnalysis = async (req, res) => {
    try {

        const { fileName, targetColumn } = req.body;

        if (!fileName || !targetColumn) {
            return res.status(400).json({
                success: false,
                message: "Missing fileName or targetColumn"
            });
        }

        const uploadDir = path.join(
            __dirname,
            "..",
            "uploads"
        );

        const filePath = path.join(
            uploadDir,
            fileName
        );

        const result = await runMlPython(
            filePath,
            targetColumn
        );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "ML Analysis Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.toString()
        });
    }
};