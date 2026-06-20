import express from "express";
import { getHealthStatus, runMlAnalysis } from "../controllers/analysisController.js";

const router = express.Router();

router.get("/health", getHealthStatus);
router.post("/ml-analyze", runMlAnalysis);

export default router;