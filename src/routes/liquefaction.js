import { Router } from "express";
import { Liquefaction } from "../models/Liquefaction.js";
import { ProcessBatch } from "../models/ProcessBatch.js";
import { processReadingEvent, recordPlantEvents } from "../services/plantEvents.js";

const router = Router();

function stripMeta(body = {}) {
  const { id, _id, slNo, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
}

async function withBatchFermenter(body) {
  const batchId = String(body.batchId || "").trim();
  if (!batchId) return body;
  const batch = await ProcessBatch.findOne({ batchId }).lean();
  if (!batch) {
    const error = new Error("Select a milling batch before saving.");
    error.status = 400;
    throw error;
  }
  return { ...body, batchId, passFermenter: batch.fermenter };
}

/** GET /api/liquefaction?view=&date=&q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.view) filter.view = String(req.query.view);
    if (req.query.date) filter.date = String(req.query.date);
    if (req.query.batchId) filter.batchId = String(req.query.batchId);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { time: new RegExp(q, "i") },
        { passFermenter: new RegExp(q, "i") },
        { enzymeBrand: new RegExp(q, "i") },
        { batchId: new RegExp(q, "i") },
      ];
    }
    const rows = await Liquefaction.find(filter).sort({ date: -1, time: 1, createdAt: 1 }).lean();
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const row = await Liquefaction.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const row = await Liquefaction.create(await withBatchFermenter(stripMeta(req.body || {})));
    await recordPlantEvents(await processReadingEvent({ Model: Liquefaction, doc: row.toObject(), isNew: true, kind: "liquefaction" }));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const row = await Liquefaction.findByIdAndUpdate(req.params.id, await withBatchFermenter(stripMeta(req.body || {})), {
      new: true,
      runValidators: true,
    }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const row = await Liquefaction.findByIdAndDelete(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
