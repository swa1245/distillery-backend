import { Router } from "express";
import { Outward } from "../models/Outward.js";
import { outwardEvents, recordPlantEvents } from "../services/plantEvents.js";

const router = Router();

function num(v) {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function withDerived(body = {}) {
  const next = { ...body };
  if (next.section === "ethanol" || (!next.section && (next.qtyKl || next.strengthPct))) {
    const qty = num(next.qtyKl);
    const strength = num(next.strengthPct);
    if (next.qtyKl || next.strengthPct) {
      next.aaQtyKl = String(Math.round(((qty * strength) / 100) * 1000) / 1000);
    }
  }
  return next;
}

/** GET /api/outward?section=&date=&q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.section) filter.section = String(req.query.section);
    if (req.query.date) filter.date = String(req.query.date);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { vehicleNo: new RegExp(q, "i") },
        { tankerNo: new RegExp(q, "i") },
        { customer: new RegExp(q, "i") },
        { product: new RegExp(q, "i") },
        { batchNo: new RegExp(q, "i") },
        { invoiceLrNo: new RegExp(q, "i") },
        { challanNo: new RegExp(q, "i") },
      ];
    }
    const rows = await Outward.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/outward/:id */
router.get("/:id", async (req, res) => {
  try {
    const row = await Outward.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** POST /api/outward */
router.post("/", async (req, res) => {
  try {
    const row = await Outward.create(withDerived(req.body || {}));
    await recordPlantEvents(outwardEvents(null, row.toObject()));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** PUT /api/outward/:id */
router.put("/:id", async (req, res) => {
  try {
    const before = await Outward.findById(req.params.id).lean();
    const row = await Outward.findByIdAndUpdate(
      req.params.id,
      withDerived(req.body || {}),
      { new: true, runValidators: true }
    ).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await recordPlantEvents(outwardEvents(before, row));
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** DELETE /api/outward/:id */
router.delete("/:id", async (req, res) => {
  try {
    const row = await Outward.findByIdAndDelete(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
