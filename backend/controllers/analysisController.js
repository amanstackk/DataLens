import { getHealthData } from "../services/analysisService.js";

export const getHealthStatus = (req, res) => {
    const data = getHealthData();
    
    res.json(data);
};