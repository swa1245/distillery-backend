import { Router } from "express";
import { LabSampleRegister } from "../models/LabSampleRegister.js";
import { labRegisterEvents, recordPlantEvents } from "../services/plantEvents.js";

const router = Router();

const SECTION_KEYS = ["grain", "slurry", "wash", "distillation", "evaporation", "ddgs"];

function stripMeta(body = {}) {
  const { id, _id, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
}

function normalizePayload(body = {}, date) {
  const clean = stripMeta(body);
  const payload = {
    date: String(date || clean.date || "").slice(0, 10),
    meta: clean.meta && typeof clean.meta === "object" ? clean.meta : {},
  };
  for (const key of SECTION_KEYS) {
    payload[key] = clean[key] && typeof clean[key] === "object" ? clean[key] : {};
  }
  return payload;
}

/** GET /api/lab-register?date=&full=1  — list sheets or one by date */
router.get("/", async (req, res) => {
  try {
    if (req.query.date) {
      const date = String(req.query.date).slice(0, 10);
      const row = await LabSampleRegister.findOne({ date }).lean();
      return res.json({ success: true, row: row || null, date });
    }
    const full = String(req.query.full || "") === "1" || String(req.query.full || "").toLowerCase() === "true";
    const q = LabSampleRegister.find({}).sort({ date: -1 });
    if (!full) q.select("date meta updatedAt createdAt");
    const rows = await q.lean();
    const dates = rows.map((r) => r.date).filter(Boolean);
    res.json({ success: true, rows, dates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/lab-register/:date */
router.get("/:date", async (req, res) => {
  try {
    const date = String(req.params.date).slice(0, 10);
    const row = await LabSampleRegister.findOne({ date }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found", date });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/lab-register/:date — upsert full sheet for date */
router.put("/:date", async (req, res) => {
  try {
    const date = String(req.params.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: "Invalid date" });
    }
    const payload = normalizePayload(req.body || {}, date);
    const before = await LabSampleRegister.findOne({ date }).lean();
    const row = await LabSampleRegister.findOneAndUpdate(
      { date },
      { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    await recordPlantEvents(labRegisterEvents(before, row));
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** POST /api/lab-register — upsert using body.date */
router.post("/", async (req, res) => {
  try {
    const date = String(req.body?.date || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: "date (YYYY-MM-DD) required" });
    }
    const payload = normalizePayload(req.body || {}, date);
    const before = await LabSampleRegister.findOne({ date }).lean();
    const row = await LabSampleRegister.findOneAndUpdate(
      { date },
      { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    await recordPlantEvents(labRegisterEvents(before, row));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** DELETE /api/lab-register/:date */
router.delete("/:date", async (req, res) => {
  try {
    const date = String(req.params.date).slice(0, 10);
    const row = await LabSampleRegister.findOneAndDelete({ date }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
