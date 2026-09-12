import { Router } from "express";
import { DistillationOperating } from "../models/DistillationOperating.js";

const router = Router();

function normalizeRow(row = {}, i = 0) {
  return {
    id: String(row.id || `r-${i + 1}`),
    section: String(row.section || "A").slice(0, 1).toUpperCase() || "A",
    slNo: String(row.slNo || ""),
    particulars: String(row.particulars || ""),
    unit: String(row.unit || ""),
    target: String(row.target || ""),
    actual: String(row.actual ?? row.output ?? ""),
  };
}

function normalizePayload(body = {}, date) {
  const rows = Array.isArray(body.rows) ? body.rows.map(normalizeRow) : [];
  return {
    date: String(date || body.date || "").slice(0, 10),
    rows,
  };
}

/** GET /api/distillation-operating?date=&full=1 */
router.get("/", async (req, res) => {
  try {
    if (req.query.date) {
      const date = String(req.query.date).slice(0, 10);
      const row = await DistillationOperating.findOne({ date }).lean();
      return res.json({ success: true, row: row || null, date });
    }
    const full =
      String(req.query.full || "") === "1" ||
      String(req.query.full || "").toLowerCase() === "true";
    const q = DistillationOperating.find({}).sort({ date: -1 });
    if (!full) q.select("date updatedAt createdAt");
    const rows = await q.lean();
    const dates = rows.map((r) => r.date).filter(Boolean);
    res.json({ success: true, rows, dates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/distillation-operating/:date */
router.get("/:date", async (req, res) => {
  try {
    const date = String(req.params.date).slice(0, 10);
    const row = await DistillationOperating.findOne({ date }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found", date });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/distillation-operating/:date — upsert full sheet for date */
router.put("/:date", async (req, res) => {
  try {
    const date = String(req.params.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: "Invalid date" });
    }
    const payload = normalizePayload(req.body || {}, date);
    const row = await DistillationOperating.findOneAndUpdate(
      { date },
      { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** POST /api/distillation-operating — upsert using body.date */
router.post("/", async (req, res) => {
  try {
    const date = String(req.body?.date || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: "date (YYYY-MM-DD) required" });
    }
    const payload = normalizePayload(req.body || {}, date);
    const row = await DistillationOperating.findOneAndUpdate(
      { date },
      { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** DELETE /api/distillation-operating/:date */
router.delete("/:date", async (req, res) => {
  try {
    const date = String(req.params.date).slice(0, 10);
    const row = await DistillationOperating.findOneAndDelete({ date }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
