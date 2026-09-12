import { Router } from "express";
import { Inward } from "../models/Inward.js";

const router = Router();

function num(v) {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function withDerived(body = {}) {
  const gross = num(body.grossWeight);
  const tare = num(body.tareWeight);
  const net =
    body.grossWeight || body.tareWeight
      ? String(Math.round(Math.max(gross - tare, 0) * 1000) / 1000)
      : body.netWeight || "";
  return { ...body, netWeight: net };
}

/** GET /api/inward?date=&q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = String(req.query.date);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { vehicleNo: new RegExp(q, "i") },
        { supplier: new RegExp(q, "i") },
        { grainType: new RegExp(q, "i") },
        { tokenId: new RegExp(q, "i") },
        { grnNo: new RegExp(q, "i") },
        { batchNo: new RegExp(q, "i") },
      ];
    }
    const rows = await Inward.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/inward/:id */
router.get("/:id", async (req, res) => {
  try {
    const row = await Inward.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/inward */
router.post("/", async (req, res) => {
  try {
    const row = await Inward.create(withDerived(req.body || {}));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** PUT /api/inward/:id */
router.put("/:id", async (req, res) => {
  try {
    const row = await Inward.findByIdAndUpdate(
      req.params.id,
      withDerived(req.body || {}),
      { new: true, runValidators: true }
    ).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** DELETE /api/inward/:id */
router.delete("/:id", async (req, res) => {
  try {
    const row = await Inward.findByIdAndDelete(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
