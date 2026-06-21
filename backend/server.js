import express from "express";
import analysisRoutes from "./routes/analysisRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DataLens API Running"
    });
});
app.use("/api", analysisRoutes);
app.use("/api", uploadRoutes);

app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Upload routes working"
    });
}); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});