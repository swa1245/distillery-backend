import { DistillationOperating } from "./models/DistillationOperating.js";

/**
 * Distillation Operating Parameters — mirrors frontend DEFAULT_PARAMS
 * (DistillationOperatingPage) so Overview PARAM_KEYS resolve cleanly.
 */
const DEFAULT_PARAMS = [
  { section: "A", slNo: "1 A", particulars: "Wash feed flow", unit: "M3", target: "45–50" },
  { section: "A", slNo: "2 A", particulars: "Wash feed temp", unit: "°C", target: "67–69" },
  { section: "A", slNo: "3 A", particulars: "DG top temp", unit: "°C", target: "67–68" },
  { section: "A", slNo: "4 A", particulars: "Analyser column", unit: "°C", target: "70" },
  { section: "A", slNo: "5 A", particulars: "Analyser column", unit: "°C", target: "84–85" },
  { section: "A", slNo: "6 A", particulars: "Analyser column", unit: "Kg/Cm²", target: "0.420–0.450" },

  { section: "B", slNo: "1 B", particulars: "PRC Vacuum", unit: "Kg/Cm²", target: "0.30–0.35" },
  { section: "B", slNo: "2 B", particulars: "PRC Top temp", unit: "°C", target: "48–49" },
  { section: "B", slNo: "3 B", particulars: "PRC draw temp", unit: "°C", target: "49–50" },
  { section: "B", slNo: "4 B", particulars: "PRC LFO temp", unit: "°C", target: "53–55" },
  { section: "B", slNo: "5 B", particulars: "PRC HFO temp", unit: "°C", target: "65–67" },
  { section: "B", slNo: "6 B", particulars: "PRC feed temp", unit: "°C", target: "68–69" },
  { section: "B", slNo: "7 B", particulars: "PRC reflux feed", unit: "LPH", target: "15000–16000" },
  { section: "B", slNo: "8 B", particulars: "PRC bottom temp", unit: "°C", target: "79–80" },

  { section: "C", slNo: "1 C", particulars: "Deheads column", unit: "Kg/Cm²", target: "0.32–0.35" },
  { section: "C", slNo: "2 C", particulars: "Top temp", unit: "°C", target: "41–42" },
  { section: "C", slNo: "3 C", particulars: "Reflux flow", unit: "LPH", target: "2700–3000" },
  { section: "C", slNo: "4 C", particulars: "Bottom temp", unit: "°C", target: "67–69" },

  { section: "D", slNo: "1 D", particulars: "PC top pressure", unit: "Kg/Cm²", target: "1" },
  { section: "D", slNo: "2 D", particulars: "PC top temp", unit: "°C", target: "92–93" },
  { section: "D", slNo: "3 D", particulars: "PC feed temp", unit: "°C", target: "88–90" },
  { section: "D", slNo: "4 D", particulars: "RC lees flow (rec)", unit: "LPH", target: "22000–23000" },
  { section: "D", slNo: "5 D", particulars: "PC DM water", unit: "LPH", target: "8000–10000" },
  { section: "D", slNo: "6 D", particulars: "PC bottom temp", unit: "°C", target: "94–95" },
  { section: "D", slNo: "7 D", particulars: "PC steam flow", unit: "Kgs/Hr", target: "2500–2800" },
  { section: "D", slNo: "8 D", particulars: "PC bottom press", unit: "Kg/Cm²", target: "1.51" },

  { section: "E", slNo: "1 E", particulars: "RC top pressure", unit: "Kg/Cm²", target: "2.3–2.5" },
  { section: "E", slNo: "2 E", particulars: "RC top temp", unit: "°C", target: "96–98" },
  { section: "E", slNo: "3 E", particulars: "RC draw temp", unit: "°C", target: "95–96" },
  { section: "E", slNo: "4 E", particulars: "RC LFO temp", unit: "°C", target: "98–99" },
  { section: "E", slNo: "5 E", particulars: "RC HFO temp", unit: "°C", target: "100–102" },
  { section: "E", slNo: "6 E", particulars: "RC feed temp", unit: "°C", target: "102–104" },
  { section: "E", slNo: "7 E", particulars: "RC reflux", unit: "LPH", target: "28000–29000" },
  { section: "E", slNo: "8 E", particulars: "RC bottom temp", unit: "°C", target: "123–125" },
  { section: "E", slNo: "9 E", particulars: "RC bottom press", unit: "Kg/Cm²", target: "2.58–2.60" },
  { section: "E", slNo: "10 E", particulars: "RC steam flow", unit: "Kgs/Hr", target: "9600–9700" },

  { section: "F", slNo: "1 F", particulars: "Simmering top p", unit: "Kg/Cm²", target: "1" },
  { section: "F", slNo: "2 F", particulars: "Top temp", unit: "°C", target: "71–72" },
  { section: "F", slNo: "3 F", particulars: "Reflux flow", unit: "LPH", target: "5500–6000" },
  { section: "F", slNo: "4 F", particulars: "Bottom temp", unit: "°C", target: "80–82" },
  { section: "F", slNo: "5 F", particulars: "Bottom pressure", unit: "Kg/Cm²", target: "0.98–1.00" },

  { section: "G", slNo: "1 G", particulars: "FOC top pressure", unit: "Kg/Cm²", target: "2.2–2.3" },
  { section: "G", slNo: "2 G", particulars: "FOC top temp", unit: "°C", target: "98–99" },
  { section: "G", slNo: "3 G", particulars: "FOC Draw feed temp", unit: "°C", target: "87–88" },
  { section: "G", slNo: "4 G", particulars: "FOC LFO temp", unit: "°C", target: "102–104" },
  { section: "G", slNo: "5 G", particulars: "FOC HFO temp", unit: "°C", target: "106–109" },
  { section: "G", slNo: "6 G", particulars: "FOC Bottom temp", unit: "°C", target: "125–126" },
  { section: "G", slNo: "7 G", particulars: "FOC Bottom Pressure", unit: "Kg/Cm²", target: "2.5–2.7" },
  { section: "G", slNo: "8 G", particulars: "FOC Reflux flow", unit: "LPH", target: "2500–2600" },
  { section: "G", slNo: "9 G", particulars: "FOC Steam flow", unit: "Kgs/Hr", target: "1100–1200" },
];

function parseRange(target) {
  const s = String(target || "")
    .replace(/[–—]/g, "-")
    .trim();
  const m = s.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };
  const n = Number(s);
  if (Number.isFinite(n)) return { min: n, max: n };
  return null;
}

function decimalsIn(target) {
  const s = String(target || "");
  const m = s.match(/\.(\d+)/);
  return m ? m[1].length : 0;
}

function formatActual(n, digits) {
  if (digits <= 0) return String(Math.round(n));
  return n.toFixed(digits);
}

/** Stable pseudo-random in [-1, 1] from date + index. */
function dayNoise(iso, idx) {
  const day = Number(String(iso).slice(-2)) || 1;
  const x = Math.sin(day * 12.9898 + idx * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function actualFor(param, iso, idx) {
  const range = parseRange(param.target);
  if (!range) return "";
  const mid = (range.min + range.max) / 2;
  const span = Math.max(range.max - range.min, Math.abs(mid) * 0.02 || 0.01);
  const n = mid + dayNoise(iso, idx) * span * 0.35;
  const clamped = Math.min(range.max, Math.max(range.min, n));
  return formatActual(clamped, decimalsIn(param.target));
}

function rowsForDate(iso) {
  return DEFAULT_PARAMS.map((p, i) => ({
    id: `seed-dop-${iso}-${p.section}-${i + 1}`,
    section: p.section,
    slNo: p.slNo,
    particulars: p.particulars,
    unit: p.unit,
    target: p.target,
    actual: actualFor(p, iso, i),
  }));
}

export async function seedDistillationOperatingRange(start, end, eachIso) {
  const dates = eachIso(start, end);
  let upserts = 0;
  for (const iso of dates) {
    const rows = rowsForDate(iso);
    await DistillationOperating.findOneAndUpdate(
      { date: iso },
      { $set: { date: iso, rows } },
      { upsert: true, new: true }
    );
    upserts += 1;
  }
  console.log(
    `  ✓ Distillation operating parameters seeded ${start} → ${end} (${upserts} sheets, ${DEFAULT_PARAMS.length} params each)`
  );
}
