import { runPython } from "./pythonService.js";

export const analyzeDataset = async (filePath) => {
    return await runPython(filePath);
};