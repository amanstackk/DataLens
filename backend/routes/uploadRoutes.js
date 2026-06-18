import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
    "/upload",
    upload.single("dataset"),
    uploadFile
);

export default router;