import { Router } from "express";
import { PlantEvent } from "../models/PlantEvent.js";

const router = Router();

/** GET /api/plant-events?since=ISO&date=YYYY-MM-DD&limit= */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.since) {
      const since = new Date(String(req.query.since));
      if (!Number.isNaN(since.getTime())) filter.at = { $gt: since };
    }
    if (req.query.date) filter.date = String(req.query.date).slice(0, 10);
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const rows = await PlantEvent.find(filter).sort({ at: -1 }).limit(limit).lean();
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
