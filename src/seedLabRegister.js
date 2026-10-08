import { LabSampleRegister } from "./models/LabSampleRegister.js";

/** Parameter specs mirror Laboratory Sample Register UI. */
const SECTIONS = {
  grain: {
    sources: 3,
    params: {
      moisture: { base: [12.4, 11.9, 11.2], jitter: 0.25, digits: 1, limits: "10.0 – 14.0" },
      starch: { base: [64.2, 64.8, 65.5], jitter: 0.4, digits: 1, limits: "≥ 62.0" },
      protein: { base: [8.6, 8.4, 8.2], jitter: 0.2, digits: 1, limits: "7.0 – 10.0" },
      fat: { base: [3.8, 3.6, 3.4], jitter: 0.15, digits: 1, limits: "≤ 5.0" },
      ash: { base: [1.4, 1.35, 1.3], jitter: 0.08, digits: 2, limits: "≤ 2.0" },
      crudeFiber: { base: [2.2, 2.1, 2.0], jitter: 0.1, digits: 1, limits: "≤ 3.5" },
      foreignMatter: { base: [1.8, 0.6, 0.2], jitter: 0.15, digits: 1, limits: "≤ 2.0" },
      brokenDamaged: { base: [3.2, 2.4, 1.6], jitter: 0.2, digits: 1, limits: "≤ 5.0" },
      testWeight: { base: [72.5, 73.0, 73.8], jitter: 0.4, digits: 1, limits: "≥ 70" },
      phSoaked: { base: [6.2, 6.1, 6.0], jitter: 0.08, digits: 2, limits: "5.8 – 6.5" },
    },
  },
  slurry: {
    sources: 3,
    params: {
      totalSolids: { base: [28.5, 26.2, 24.8], jitter: 0.5, digits: 1, limits: "22 – 32" },
      tds: { base: [22.0, 20.5, 19.2], jitter: 0.4, digits: 1, limits: "—" },
      tss: { base: [6.5, 5.7, 5.2], jitter: 0.3, digits: 1, limits: "—" },
      brix: { base: [18.5, 17.2, 16.0], jitter: 0.35, digits: 1, limits: "15 – 22" },
      ph: { base: [5.6, 5.4, 5.1], jitter: 0.08, digits: 2, limits: "5.0 – 5.8" },
      viscosity: { base: [420, 380, 340], jitter: 25, digits: 0, limits: "≤ 500" },
      temperature: { base: [88.0, 86.5, 84.0], jitter: 0.8, digits: 1, limits: "82 – 92" },
      enzymeDosage: { base: [280, 260, 240], jitter: 12, digits: 0, limits: "200 – 350" },
      cookingTime: { base: [45, 42, 40], jitter: 2, digits: 0, limits: "35 – 55" },
    },
  },
  wash: {
    sources: 4,
    params: {
      ph: { base: [4.5, 4.45, 4.2, 4.1], jitter: 0.06, digits: 2, limits: "4.2 – 4.8" },
      temperature: { base: [32.8, 32.2, 48.0, 72.0], jitter: 0.5, digits: 1, limits: "—" },
      totalSolids: { base: [12.5, 11.8, 8.2, 6.5], jitter: 0.3, digits: 1, limits: "—" },
      tds: { base: [9.8, 9.2, 6.5, 5.1], jitter: 0.25, digits: 1, limits: "—" },
      tss: { base: [2.7, 2.4, 1.6, 1.2], jitter: 0.15, digits: 1, limits: "—" },
      brix: { base: [8.5, 7.8, 4.2, 2.8], jitter: 0.25, digits: 1, limits: "—" },
      alcoholVv: { base: [10.8, 10.5, 0.4, 0.15], jitter: 0.2, digits: 2, limits: "≥ 10.0 (wash)" },
      reducingSugars: { base: [1.8, 1.5, 0.6, 0.3], jitter: 0.12, digits: 1, limits: "≤ 2.5" },
      starch: { base: [0.9, 0.7, 0.4, 0.2], jitter: 0.08, digits: 1, limits: "≤ 1.5" },
      acidityLactic: { base: [0.35, 0.32, 0.28, 0.22], jitter: 0.03, digits: 2, limits: "≤ 0.50" },
    },
  },
  distillation: {
    sources: 4,
    params: {
      alcoholContent: { base: [55.0, 95.2, 99.6, 0.8], jitter: 0.35, digits: 1, limits: "RS ≥ 94.5 / AA ≥ 99.5" },
      apparentExtract: { base: [1.2, 0.15, 0.05, 2.8], jitter: 0.08, digits: 2, limits: "—" },
      acidityAcetic: { base: [0.012, 0.006, 0.003, 0.02], jitter: 0.001, digits: 3, limits: "≤ 0.02" },
      ester: { base: [85, 42, 18, 120], jitter: 6, digits: 0, limits: "≤ 100 (RS)" },
      aldehyde: { base: [28, 12, 4, 45], jitter: 3, digits: 0, limits: "≤ 20 (RS)" },
      methanol: { base: [180, 95, 35, 220], jitter: 12, digits: 0, limits: "≤ 300" },
      fuselOil: { base: [220, 110, 40, 280], jitter: 15, digits: 0, limits: "≤ 250 (RS)" },
      copper: { base: [1.8, 0.9, 0.3, 2.4], jitter: 0.15, digits: 1, limits: "≤ 2.0" },
      ph: { base: [5.8, 6.4, 6.8, 5.2], jitter: 0.08, digits: 2, limits: "—" },
      temperature: { base: [78.0, 78.5, 78.2, 102.0], jitter: 0.4, digits: 1, limits: "—" },
    },
  },
  evaporation: {
    sources: 4,
    params: {
      totalSolids: { base: [6.8, 28.5, 0.4, 0.25], jitter: 0.35, digits: 1, limits: "Thick ≥ 25" },
      tds: { base: [5.5, 24.0, 0.3, 0.18], jitter: 0.3, digits: 1, limits: "—" },
      brix: { base: [5.2, 26.0, 0.2, 0.1], jitter: 0.3, digits: 1, limits: "—" },
      ph: { base: [4.1, 4.0, 6.5, 6.8], jitter: 0.08, digits: 2, limits: "—" },
      temperature: { base: [68.0, 72.0, 55.0, 48.0], jitter: 0.8, digits: 1, limits: "—" },
      color: { base: ["Amber", "Dark brown", "Clear", "Clear"], jitter: 0, digits: 0, limits: "Visual", visual: true },
    },
  },
  ddgs: {
    sources: 3,
    params: {
      moisture: { base: [62.0, 28.5, 10.8], jitter: 0.6, digits: 1, limits: "Final ≤ 12" },
      protein: { base: [18.5, 24.0, 28.5], jitter: 0.4, digits: 1, limits: "≥ 26 (final)" },
      fiber: { base: [8.2, 9.0, 9.5], jitter: 0.25, digits: 1, limits: "—" },
      fat: { base: [6.5, 7.8, 8.2], jitter: 0.2, digits: 1, limits: "—" },
      ash: { base: [3.8, 4.2, 4.5], jitter: 0.15, digits: 1, limits: "—" },
      starch: { base: [4.5, 3.2, 2.4], jitter: 0.2, digits: 1, limits: "≤ 5.0" },
      color: { base: ["Light brown", "Golden", "Golden brown"], jitter: 0, digits: 0, limits: "Visual", visual: true },
      bulkDensity: { base: [380, 420, 450], jitter: 12, digits: 0, limits: "400 – 500" },
    },
  },
};

function dayIndex(iso) {
  return Number(String(iso).slice(-2)) || 1;
}

function roundN(n, digits) {
  if (!Number.isFinite(n)) return "";
  if (digits <= 0) return String(Math.round(n));
  const f = 10 ** digits;
  return (Math.round(n * f) / f).toFixed(digits);
}

function jitterVal(base, jitter, day, idx, sourceIdx) {
  if (typeof base === "string") return base;
  const wave = Math.sin((day + idx * 1.7 + sourceIdx * 0.9) * 0.8) * jitter;
  const step = ((day + idx + sourceIdx) % 5) * (jitter * 0.15);
  return base + wave + step;
}

function buildParamRow(spec, day, paramIdx) {
  const row = { limits: spec.limits || "", remarks: day % 4 === 0 ? "Retest advised" : "Within limits" };
  for (let s = 0; s < spec.base.length; s += 1) {
    const key = `s${s}`;
    if (spec.visual) {
      row[key] = spec.base[s];
    } else {
      const v = jitterVal(spec.base[s], spec.jitter || 0, day, paramIdx, s);
      row[key] = roundN(Math.max(0, v), spec.digits ?? 1);
    }
  }
  return row;
}

function buildSection(sectionId, iso) {
  const cfg = SECTIONS[sectionId];
  const day = dayIndex(iso);
  const data = {};
  let i = 0;
  for (const [key, spec] of Object.entries(cfg.params)) {
    data[key] = buildParamRow(spec, day, i);
    i += 1;
  }
  return data;
}

function buildSheet(iso) {
  const day = dayIndex(iso);
  const shifts = ["A", "B", "C"];
  return {
    date: iso,
    meta: {
      plantUnit: "BioFuelPro Distillery",
      shift: shifts[day % 3],
      analysedBy: day % 2 === 0 ? "Lab Chemist" : "QC Analyst",
      reportNo: `LAB-${iso.replace(/-/g, "")}`,
      pageNo: "1",
      pageOf: "1",
      reviewedBy: "Lab Incharge",
      generalRemarks: "Routine plant sampling — grain to DDGS chain OK",
      checkedBy: "Shift Chemist",
      approvedBy: "QC Head",
      approvedAt: `${iso} 18:30`,
    },
    grain: buildSection("grain", iso),
    slurry: buildSection("slurry", iso),
    wash: buildSection("wash", iso),
    distillation: buildSection("distillation", iso),
    evaporation: buildSection("evaporation", iso),
    ddgs: buildSection("ddgs", iso),
  };
}

/**
 * Seed Laboratory Sample Register for date range (one full sheet per day).
 */
export async function seedLabRegisterRange(start, end, eachIsoFn) {
  const dates = eachIsoFn(start, end);
  await LabSampleRegister.deleteMany({ date: { $gte: start, $lte: end } });

  const docs = dates.map((iso) => buildSheet(iso));
  if (docs.length) await LabSampleRegister.insertMany(docs);

  console.log(`  ✓ Laboratory Sample Register seeded ${start} → ${end} (${docs.length} daily sheets)`);
}
