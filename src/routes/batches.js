import { Router } from "express";
import { ProcessBatch } from "../models/ProcessBatch.js";
import { batchCreatedEvent, recordPlantEvents } from "../services/plantEvents.js";

const router = Router();
const FERMENTERS = ["F1", "F2", "F3", "F4", "F5", "F6"];
const DURATIONS = [30, 40, 60, 90];

export function formatBatchId(isoDate, fermenter) {
  const match = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const ferm = String(fermenter || "").trim().toUpperCase();
  if (!match || !FERMENTERS.includes(ferm)) return "";
  return `${match[3]}-${match[2]}-${match[1]}-${ferm}`;
}

/** GET /api/batches?q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    const q = String(req.query.q || "").trim();
    if (q) {
      filter.$or = [{ batchId: new RegExp(q, "i") }, { fermenter: new RegExp(q, "i") }];
    }
    const rows = await ProcessBatch.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/batches  { startDate, fermenter, durationHours } */
router.post("/", async (req, res) => {
  try {
    const startDate = String(req.body?.startDate || "").slice(0, 10);
    const fermenter = String(req.body?.fermenter || "").trim().toUpperCase();
    const durationHours = DURATIONS.includes(Number(req.body?.durationHours))
      ? Number(req.body.durationHours)
      : 30;
    const batchId = formatBatchId(startDate, fermenter);
    if (!batchId) {
      return res.status(400).json({ success: false, message: "Date and fermenter are required." });
    }
    const existing = await ProcessBatch.findOne({ batchId }).lean();
    if (existing) {
      return res.json({ success: true, row: existing, existing: true });
    }
    const row = await ProcessBatch.create({ batchId, startDate, fermenter, durationHours });
    await recordPlantEvents(batchCreatedEvent(row.toObject()));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
