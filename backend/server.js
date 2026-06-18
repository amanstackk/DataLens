import express from "express";
import analysisRoutes from "./routes/analysisRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

const PORT = 5000;

app.use("/api", analysisRoutes);
app.use("/api", uploadRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});