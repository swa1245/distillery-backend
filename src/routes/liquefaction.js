import { Router } from "express";
import { Liquefaction } from "../models/Liquefaction.js";

const router = Router();

function stripMeta(body = {}) {
  const { id, _id, slNo, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
}

/** GET /api/liquefaction?view=&date=&q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.view) filter.view = String(req.query.view);
    if (req.query.date) filter.date = String(req.query.date);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { time: new RegExp(q, "i") },
        { passFermenter: new RegExp(q, "i") },
        { enzymeBrand: new RegExp(q, "i") },
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
    const row = await Liquefaction.create(stripMeta(req.body || {}));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const row = await Liquefaction.findByIdAndUpdate(req.params.id, stripMeta(req.body || {}), {
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
