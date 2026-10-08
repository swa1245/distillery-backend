import { Router } from "express";
import { StoreSheet } from "../models/StoreSheet.js";
import { recordPlantEvents, storeEvents } from "../services/plantEvents.js";

const router = Router();

const SHEET_TYPES = new Set([
  "items",
  "stock",
  "indent",
  "grn",
  "issue",
  "transfer",
  "adjustment",
  "alerts",
  "expiry",
]);

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row, i) => {
    const base = row && typeof row === "object" ? { ...row } : {};
    delete base._id;
    return {
      ...base,
      id: String(base.id || `r-${i + 1}`),
      slNo: base.slNo ?? i + 1,
    };
  });
}

function assertSheetType(sheetType) {
  const t = String(sheetType || "").trim().toLowerCase();
  if (!SHEET_TYPES.has(t)) return null;
  return t;
}

/** GET /api/store/:sheetType?date=&full=1 */
router.get("/:sheetType", async (req, res) => {
  try {
    const sheetType = assertSheetType(req.params.sheetType);
    if (!sheetType) {
      return res.status(400).json({ success: false, message: "Invalid sheet type" });
    }
    if (req.query.date) {
      const date = String(req.query.date).slice(0, 10);
      const row = await StoreSheet.findOne({ sheetType, date }).lean();
      return res.json({ success: true, row: row || null, date, sheetType });
    }
    const full =
      String(req.query.full || "") === "1" ||
      String(req.query.full || "").toLowerCase() === "true";
    const q = StoreSheet.find({ sheetType }).sort({ date: -1 });
    if (!full) q.select("date updatedAt createdAt sheetType");
    const rows = await q.lean();
    const dates = rows.map((r) => r.date).filter(Boolean);
    res.json({ success: true, rows, dates, sheetType });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/store/:sheetType/:date */
router.get("/:sheetType/:date", async (req, res) => {
  try {
    const sheetType = assertSheetType(req.params.sheetType);
    if (!sheetType) {
      return res.status(400).json({ success: false, message: "Invalid sheet type" });
    }
    const date = String(req.params.date).slice(0, 10);
    const row = await StoreSheet.findOne({ sheetType, date }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found", date, sheetType });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** PUT /api/store/:sheetType/:date — upsert full sheet for date */
router.put("/:sheetType/:date", async (req, res) => {
  try {
    const sheetType = assertSheetType(req.params.sheetType);
    if (!sheetType) {
      return res.status(400).json({ success: false, message: "Invalid sheet type" });
    }
    const date = String(req.params.date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: "Invalid date" });
    }
    const payload = {
      sheetType,
      date,
      rows: normalizeRows(req.body?.rows),
    };
    const before = await StoreSheet.findOne({ sheetType, date }).lean();
    const row = await StoreSheet.findOneAndUpdate(
      { sheetType, date },
      { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    await recordPlantEvents(storeEvents(sheetType, date, before?.rows, row?.rows));
    res.json({ success: true, row });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/** DELETE /api/store/:sheetType/:date */
router.delete("/:sheetType/:date", async (req, res) => {
  try {
    const sheetType = assertSheetType(req.params.sheetType);
    if (!sheetType) {
      return res.status(400).json({ success: false, message: "Invalid sheet type" });
    }
    const date = String(req.params.date).slice(0, 10);
    const row = await StoreSheet.findOneAndDelete({ sheetType, date }).lean();
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
