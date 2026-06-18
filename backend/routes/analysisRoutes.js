import express from "express";
import { getHealthStatus } from "../controllers/analysisController.js";

const router = express.Router();

router.get("/health", getHealthStatus);

export default router;