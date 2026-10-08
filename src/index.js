import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import inwardRoutes from "./routes/inward.js";
import outwardRoutes from "./routes/outward.js";
import millingRoutes from "./routes/milling.js";
import batchRoutes from "./routes/batches.js";
import liquefactionRoutes from "./routes/liquefaction.js";
import prefermenterRoutes from "./routes/prefermenter.js";
import fermenterRoutes from "./routes/fermenter.js";
import labRegisterRoutes from "./routes/labRegister.js";
import distillationOperatingRoutes from "./routes/distillationOperating.js";
import storeRoutes from "./routes/store.js";
import dprRoutes from "./routes/dpr.js";
import authRoutes from "./routes/auth.js";
import plantEventRoutes from "./routes/plantEvents.js";

const app = express();
const port = Number(process.env.PORT) || 5190;
const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: corsOrigin === "*" ? true : corsOrigin.split(",") }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "distiller-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/inward", inwardRoutes);
app.use("/api/outward", outwardRoutes);
app.use("/api/milling", millingRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/liquefaction", liquefactionRoutes);
app.use("/api/prefermenter", prefermenterRoutes);
app.use("/api/fermenter", fermenterRoutes);
app.use("/api/lab-register", labRegisterRoutes);
app.use("/api/distillation-operating", distillationOperatingRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/dpr", dprRoutes);
app.use("/api/plant-events", plantEventRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Server error" });
});

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/distiller";

connectDb(uri)
  .then(() => {
    app.listen(port, () => {
      console.log(`distiller-backend on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
