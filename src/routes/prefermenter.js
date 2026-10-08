import { Router } from "express";
import { Prefermenter } from "../models/Prefermenter.js";
import { ProcessBatch } from "../models/ProcessBatch.js";

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
  return clockMinutes(a.time || a.timeH) - clockMinutes(b.time || b.timeH);
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
  return { ...body, batchId, passFermenter: batch.fermenter };
}

/** GET /api/prefermenter?view=&date=&batchId=&q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.view) filter.view = String(req.query.view);
    if (req.query.date) filter.date = String(req.query.date);
    if (req.query.batchId) filter.batchId = String(req.query.batchId);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { pfNumber: new RegExp(q, "i") },
        { stage: new RegExp(q, "i") },
        { passFermenter: new RegExp(q, "i") },
        { batchId: new RegExp(q, "i") },
        { time: new RegExp(q, "i") },
      ];
    }
    const rows = await Prefermenter.find(filter).lean();
    rows.sort(bySheetTime);
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const row = await Prefermenter.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const row = await Prefermenter.create(await withBatchFermenter(stripMeta(req.body || {})));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const row = await Prefermenter.findByIdAndUpdate(req.params.id, await withBatchFermenter(stripMeta(req.body || {})), {
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
    const row = await Prefermenter.findByIdAndDelete(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
