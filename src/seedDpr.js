import { DprSheet } from "./models/DprSheet.js";

/**
 * DPR section definitions + agreed targets for seeding.
 * Keys must match frontend distiller/src/data/dprSections.js
 */
const SECTIONS = {
  "liquefaction-fermentation": {
    feedStock: { agreed: "Maize", base: "Maize", text: true },
    grainUsed: { agreed: "160", base: 155, jitter: 4, digits: 2 },
    starchContent: { agreed: "65", base: 64.5, jitter: 0.6, digits: 1 },
    moistureContent: { agreed: "12", base: 11.8, jitter: 0.5, digits: 1 },
    washMade: { agreed: "6200", base: 6020, jitter: 180, digits: 0 },
    grainDistilled: { agreed: "160", base: 152, jitter: 4, digits: 2 },
    theoreticalYield: { agreed: "72000", base: 70500, jitter: 800, digits: 0 },
    practicalYield: { agreed: "67000", base: 65800, jitter: 900, digits: 0 },
    fermentationEff: { agreed: "94", base: 93.2, jitter: 0.7, digits: 2 },
    thinSlopRecycleM3: { agreed: "950", base: 880, jitter: 60, digits: 0 },
    thinSlopRecyclePct: { agreed: "14", base: 13.2, jitter: 0.8, digits: 1 },
    avgAlFermenters: { agreed: "11.2", base: 11.0, jitter: 0.35, digits: 2 },
    processWater: { agreed: "560", base: 540, jitter: 30, digits: 0 },
    processCondensateM3: { agreed: "48", base: 44, jitter: 4, digits: 1 },
    processCondensatePct: { agreed: "8", base: 7.6, jitter: 0.5, digits: 1 },
  },
  distillation: {
    totalWashDistilled: { agreed: "6000", base: 5850, jitter: 150, digits: 0 },
    avgAlBeerWell: { agreed: "11.0", base: 10.85, jitter: 0.25, digits: 2 },
    rsProduction: { agreed: "72", base: 70.5, jitter: 2.2, digits: 2 },
    aaProduction: { agreed: "70", base: 68.4, jitter: 2.0, digits: 2 },
    concRs: { agreed: "95.0", base: 94.8, jitter: 0.35, digits: 1 },
    concAa: { agreed: "99.6", base: 99.5, jitter: 0.15, digits: 1 },
    technicalAlcohol: { agreed: "420", base: 390, jitter: 35, digits: 0 },
    concImpureSpirit: { agreed: "180", base: 165, jitter: 20, digits: 0 },
    totalProduction1: { agreed: "70500", base: 68800, jitter: 900, digits: 0 },
    totalProduction2: { agreed: "70500", base: 68800, jitter: 900, digits: 0 },
    distillationEff: { agreed: "98.5", base: 98.1, jitter: 0.4, digits: 1 },
    recovery: { agreed: "450", base: 441, jitter: 6, digits: 1 },
    impureSpiritCut: { agreed: "0.35", base: 0.32, jitter: 0.04, digits: 2 },
  },
  evaporation: {
    totalThinSlop: { agreed: "5200", base: 5050, jitter: 120, digits: 0 },
    thinSlopFeedSolids: { agreed: "8.5", base: 8.2, jitter: 0.35, digits: 1 },
    concentrateProduced: { agreed: "820", base: 790, jitter: 35, digits: 0 },
    concentrateSolids: { agreed: "32", base: 30.5, jitter: 1.2, digits: 1 },
    processCondensate: { agreed: "4200", base: 4050, jitter: 100, digits: 0 },
    processCondensateRecycle: { agreed: "3800", base: 3650, jitter: 90, digits: 0 },
  },
  "decanter-solids": {
    decanterFeedFlow: { agreed: "480", base: 460, jitter: 25, digits: 0 },
    decanterFeedTs: { agreed: "12", base: 11.6, jitter: 0.5, digits: 1 },
    decanterCakeTs: { agreed: "32", base: 31.2, jitter: 1.0, digits: 1 },
    decanterCentrateTs: { agreed: "4.5", base: 4.2, jitter: 0.3, digits: 1 },
    ddgsProductionMt: { agreed: "40", base: 38.5, jitter: 2.0, digits: 1 },
    ddgsProductionMtDay: { agreed: "40", base: 38.5, jitter: 2.0, digits: 1 },
  },
  "chemical-consumption": {
    ady: { agreed: "85", base: 78, jitter: 6, digits: 0 },
    urea: { agreed: "120", base: 112, jitter: 8, digits: 0 },
    liquefactionEnzyme: { agreed: "45", base: 42, jitter: 3, digits: 1 },
    saccharificationEnzyme: { agreed: "55", base: 51, jitter: 4, digits: 1 },
    mechClean: { agreed: "80", base: 75, jitter: 5, digits: 0 },
    formalinCip: { agreed: "25", base: 22, jitter: 3, digits: 1 },
  },
  utilities: {
    steamBoilerTon: { agreed: "480", base: 465, jitter: 15, digits: 1 },
    steamBoilerKgKl: { agreed: "6800", base: 6720, jitter: 120, digits: 0 },
    steamDistTon: { agreed: "320", base: 308, jitter: 12, digits: 1 },
    steamDistKgKl: { agreed: "4500", base: 4420, jitter: 90, digits: 0 },
    steamEvapTon: { agreed: "150", base: 142, jitter: 8, digits: 1 },
  },
  "water-consumption": {
    softWater: { agreed: "220", base: 205, jitter: 15, digits: 0 },
    processWater: { agreed: "560", base: 540, jitter: 25, digits: 0 },
  },
  "electricity-consumption": {
    powerConsumption: { agreed: "1350", base: 1305, jitter: 55, digits: 0 },
  },
  "plant-running-hours": {
    liquificationHours: { agreed: "24", base: 23.2, jitter: 0.6, digits: 1 },
    distillationHours: { agreed: "24", base: 23.5, jitter: 0.5, digits: 1 },
    evaporationHours: { agreed: "22", base: 21.4, jitter: 0.8, digits: 1 },
  },
};

function dayNoise(iso, key) {
  const day = Number(String(iso).slice(-2)) || 1;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const x = Math.sin(day * 12.9898 + h * 0.017) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function fmt(n, digits) {
  if (digits <= 0) return String(Math.round(n));
  return Number(n).toFixed(digits);
}

function buildByKey(spec, dates) {
  const byKey = {};
  for (const [key, cfg] of Object.entries(spec)) {
    const values = {};
    for (const iso of dates) {
      if (cfg.text) {
        values[iso] = String(cfg.base);
        continue;
      }
      const n = cfg.base + dayNoise(iso, key) * cfg.jitter;
      values[iso] = fmt(n, cfg.digits ?? 2);
    }
    byKey[key] = { agreed: String(cfg.agreed ?? ""), values };
  }
  return byKey;
}

export async function seedDprRange(start, end, eachIso) {
  const dates = eachIso(start, end);
  let upserts = 0;
  for (const [sectionId, spec] of Object.entries(SECTIONS)) {
    const byKey = buildByKey(spec, dates);
    await DprSheet.findOneAndUpdate(
      { sectionId },
      { $set: { sectionId, byKey } },
      { upsert: true, new: true }
    );
    upserts += 1;
  }
  console.log(
    `  ✓ DPR sheets seeded ${start} → ${end} (${upserts} sections, ${dates.length} days each)`
  );
}
