import { Router } from "express";
import { Milling } from "../models/Milling.js";

const router = Router();

function stripMeta(body = {}) {
  const { id, _id, slNo, __v, createdAt, updatedAt, ...rest } = body;
  return rest;
}

/** GET /api/milling?date=&q= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = String(req.query.date);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { time: new RegExp(q, "i") },
        { passFermenter: new RegExp(q, "i") },
        { remarks: new RegExp(q, "i") },
        { shift: new RegExp(q, "i") },
      ];
    }
    const rows = await Milling.find(filter).sort({ date: -1, time: 1, createdAt: 1 }).lean();
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const row = await Milling.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const row = await Milling.create(stripMeta(req.body || {}));
    res.status(201).json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const row = await Milling.findByIdAndUpdate(req.params.id, stripMeta(req.body || {}), {
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
    const row = await Milling.findByIdAndDelete(req.params.id).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
