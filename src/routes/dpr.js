import { Router } from "express";
import { DprSheet } from "../models/DprSheet.js";

const router = Router();

function normalizeByKey(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!key) continue;
    const agreed = val?.agreed != null ? String(val.agreed) : "";
    const values = {};
    if (val?.values && typeof val.values === "object" && !Array.isArray(val.values)) {
      for (const [d, v] of Object.entries(val.values)) {
        const iso = String(d || "").slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) values[iso] = v == null ? "" : String(v);
      }
    }
    out[key] = { agreed, values };
  }
  return out;
}

/** GET /api/dpr — list all sections */
router.get("/", async (_req, res) => {
  try {
    const rows = await DprSheet.find({}).sort({ sectionId: 1 }).lean();
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/dpr/:sectionId */
router.get("/:sectionId", async (req, res) => {
  try {
    const sectionId = String(req.params.sectionId || "").trim();
    const row = await DprSheet.findOne({ sectionId }).lean();
    res.json({ success: true, row: row || { sectionId, byKey: {} } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/dpr/:sectionId — upsert byKey map */
router.put("/:sectionId", async (req, res) => {
  try {
    const sectionId = String(req.params.sectionId || "").trim();
    if (!sectionId) return res.status(400).json({ success: false, message: "sectionId required" });
    const byKey = normalizeByKey(req.body?.byKey ?? req.body);
    const row = await DprSheet.findOneAndUpdate(
      { sectionId },
      { $set: { sectionId, byKey } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
