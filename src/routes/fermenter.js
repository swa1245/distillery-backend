import { Router } from "express";
import { Fermenter } from "../models/Fermenter.js";
import { ProcessBatch } from "../models/ProcessBatch.js";
import { processReadingEvent, recordPlantEvents } from "../services/plantEvents.js";

const router = Router();

function clockMinutes(time) {
  const m = String(time || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = Number(m[1]);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + Number(m[2]);
}

function bySheetTime(a, b) {
  const date = String(a.date || "").localeCompare(String(b.date || ""));
  if (date) return date;
  return clockMinutes(a.time) - clockMinutes(b.time);
}

function stripMeta(body = {}) {
  const { id, _id, slNo, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
}

async function withBatchFermenter(body) {
  const batchId = String(body.batchId || "").trim();
  if (!batchId) return body;
  const batch = await ProcessBatch.findOne({ batchId }).lean();
  if (!batch) {
    const error = new Error("Create the batch before saving readings.");
    error.status = 400;
    throw error;
  }
  return { ...body, batchId, fermenterNo: batch.fermenter };
}

/** GET /api/fermenter?view=&date=&batchId=&q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.view) filter.view = String(req.query.view);
    if (req.query.date) filter.date = String(req.query.date);
    if (req.query.batchId) filter.batchId = String(req.query.batchId);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { fermenterNo: new RegExp(q, "i") },
        { batchId: new RegExp(q, "i") },
        { status: new RegExp(q, "i") },
        { time: new RegExp(q, "i") },
      ];
    }
    const rows = await Fermenter.find(filter).lean();
    rows.sort(bySheetTime);
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const row = await Fermenter.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const row = await Fermenter.create(await withBatchFermenter(stripMeta(req.body || {})));
    await recordPlantEvents(await processReadingEvent({ Model: Fermenter, doc: row.toObject(), isNew: true, kind: "fermenter" }));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const row = await Fermenter.findByIdAndUpdate(req.params.id, await withBatchFermenter(stripMeta(req.body || {})), {
      new: true,
      runValidators: true,
    }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const row = await Fermenter.findByIdAndDelete(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
