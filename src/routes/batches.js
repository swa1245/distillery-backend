import { Router } from "express";
import { ProcessBatch } from "../models/ProcessBatch.js";
import { batchCreatedEvent, recordPlantEvents } from "../services/plantEvents.js";

const router = Router();
const DURATIONS = [30, 40, 60, 90];

export function formatBatchId(isoDate, fermenter) {
  const match = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const ferm = String(fermenter || "").trim().toUpperCase();
  if (!match || !ferm) return "";
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
    const fermenter = String(req.body?.fermenter || "").trim().toUpperCase().slice(0, 40);
    const durationHours = DURATIONS.includes(Number(req.body?.durationHours))
      ? Number(req.body.durationHours)
      : 30;
    if (!startDate || !fermenter) {
      return res.status(400).json({ success: false, message: "Date and fermenter are required." });
    }
    const typed = String(req.body?.batchId || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 80);
    const batchId = typed || formatBatchId(startDate, fermenter);
    if (!batchId) {
      return res.status(400).json({ success: false, message: "Enter a batch name." });
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

/** POST /api/batches/:batchId/notes  { area, text } */
router.post("/:batchId/notes", async (req, res) => {
  try {
    const batchId = String(req.params.batchId || "").trim();
    const area = String(req.body?.area || "").trim();
    const text = String(req.body?.text || "").trim().slice(0, 2000);
    if (!batchId) {
      return res.status(400).json({ success: false, message: "Batch name is required." });
    }
    if (area !== "prefermenter" && area !== "fermenter") {
      return res.status(400).json({ success: false, message: "Note area is required." });
    }
    if (!text) {
      return res.status(400).json({ success: false, message: "Type a note." });
    }
    const row = await ProcessBatch.findOneAndUpdate(
      { batchId },
      { $push: { notes: { area, text, createdAt: new Date() } } },
      { new: true }
    ).lean();
    if (!row) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** DELETE /api/batches/:batchId */
router.delete("/:batchId", async (req, res) => {
  try {
    const batchId = String(req.params.batchId || "").trim();
    if (!batchId) {
      return res.status(400).json({ success: false, message: "Batch name is required." });
    }
    const row = await ProcessBatch.findOneAndDelete({ batchId });
    if (!row) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
