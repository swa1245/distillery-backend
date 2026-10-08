import { Milling } from "./models/Milling.js";
import { Liquefaction } from "./models/Liquefaction.js";
import { Prefermenter } from "./models/Prefermenter.js";
import { Fermenter } from "./models/Fermenter.js";

const SHIFT_SLOTS = [
  { shift: "A", time: "7:00 AM" },
  { shift: "A", time: "9:00 AM" },
  { shift: "A", time: "11:00 AM" },
  { shift: "A", time: "1:00 PM" },
  { shift: "B", time: "3:00 PM" },
  { shift: "B", time: "5:00 PM" },
  { shift: "B", time: "7:00 PM" },
  { shift: "B", time: "9:00 PM" },
  { shift: "C", time: "11:00 PM" },
  { shift: "C", time: "1:00 AM" },
  { shift: "C", time: "3:00 AM" },
  { shift: "C", time: "5:00 AM" },
];

const FERMENTERS = ["F1", "F2", "F3", "F4", "F5", "F6"];

function round1(n) {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function round2(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function round3(n) {
  return (Math.round(n * 1000) / 1000).toFixed(3);
}

function dayIndex(iso) {
  return Number(String(iso).slice(-2)) || 1;
}

function passF(iso, slotIdx) {
  return FERMENTERS[(dayIndex(iso) + slotIdx) % FERMENTERS.length];
}

function millingRowsForDate(iso) {
  const d = dayIndex(iso);
  return SHIFT_SLOTS.map((slot, i) => {
    const maize = 12.4 + ((d + i) % 5) * 0.15;
    const um12 = 1.7 + (i % 4) * 0.15;
    const um1 = 4.4 + (i % 3) * 0.2;
    const um085 = 17.2 + (i % 5) * 0.35;
    const um06 = 27.5 + (i % 4) * 0.4;
    const um03 = 21.8 + (i % 5) * 0.3;
    const fine = Math.max(20, 100 - um12 - um1 - um085 - um06 - um03);
    const starch = 63.8 + ((d + i) % 6) * 0.3;
    return {
      date: iso,
      shift: slot.shift,
      time: slot.time,
      maize: round1(maize),
      jowar: i === 2 ? "0.5" : "0",
      brownRice: round1(0.9 + (i % 4) * 0.1),
      um12: round1(um12),
      um1: round1(um1),
      um085: round1(um085),
      um06: round1(um06),
      um03: round1(um03),
      mesh1180_0850: round1(um12 + um085),
      mesh0600_0300: round1(um06 + um03),
      finePowder: round1(fine),
      starch: round1(starch),
      passFermenter: passF(iso, i),
      remarks: `Plant grind ${slot.shift} — sieve & starch OK`,
    };
  });
}

function liquefactionRowsForDate(iso) {
  const d = dayIndex(iso);
  return SHIFT_SLOTS.map((slot, i) => {
    const flour = 12.5 + ((d + i) % 4) * 0.25;
    const thin = 1800 + i * 25 + d * 5;
    const pw = 4200 + i * 35 + d * 8;
    const cond = 1100 + i * 12;
    const lees = 350 + (i % 4) * 18;
    const hot = pw + cond + lees;
    // Mild drift across the day so Transfer Details trends show a real curve
    const drift = (i / Math.max(SHIFT_SLOTS.length - 1, 1)) * 0.18;
    return {
      view: "liquefaction",
      date: iso,
      shift: slot.shift,
      time: slot.time,
      flourTph: round1(flour),
      thinSlopLph: String(thin),
      processWaterLph: String(pw),
      lessCondensateLph: String(cond),
      leesLph: String(lees),
      hotRate: String(hot),
      slurryFlourRate: round2(flour * 0.92),
      enzymeBrand: "Alpha-Amylase Thermo",
      enzymeQty: round1(flour * 0.35),
      stTemp: round1(87 + (i % 3) - drift * 2),
      stLevel: String(65 + (i % 5)),
      stSg: round3(1.083 + (i % 4) * 0.002 - drift * 0.004),
      stPh: round2(5.55 + (i % 3) * 0.05 - drift * 0.15),
      lt1Temp: round1(71 + (i % 3) - drift),
      lt1Level: String(70 + (i % 4)),
      lt1Sg: round3(1.076 + (i % 3) * 0.002 - drift * 0.003),
      lt1Ph: round2(5.35 + (i % 2) * 0.05 - drift * 0.12),
      lt2Temp: round1(61 + (i % 2) + drift * 1.5),
      lt2Level: String(74 + (i % 5)),
      lt2Sg: round3(1.071 + (i % 3) * 0.001 - drift * 0.002),
      lt2Ph: round2(5.18 + (i % 3) * 0.04 + drift * 0.08),
      lt2Ds: round1(28 + (i % 4) * 0.3),
      lt2Rs: round1(2.0 + (i % 3) * 0.2),
      lt2Iodine: "NEGATIVE",
      passFermenter: passF(iso, i),
    };
  });
}

function prefermenterRowsForDate(iso) {
  const d = dayIndex(iso);
  const plan = [
    { stage: "Setup", time: "6:00 AM", pf: "1", f: "F1", dose: true },
    { stage: "Setup", time: "8:00 AM", pf: "1", f: "F1", dose: false },
    { stage: "Transfer", time: "10:00 AM", pf: "1", f: "F1", dose: false },
    { stage: "Setup", time: "11:00 AM", pf: "2", f: "F2", dose: true },
    { stage: "Setup", time: "1:00 PM", pf: "2", f: "F2", dose: false },
    { stage: "Transfer", time: "3:00 PM", pf: "2", f: "F2", dose: false },
    { stage: "Setup", time: "4:00 PM", pf: "1", f: "F3", dose: true },
    { stage: "Transfer", time: "7:00 PM", pf: "1", f: "F3", dose: false },
    { stage: "Setup", time: "8:00 PM", pf: "2", f: "F4", dose: true },
    { stage: "Transfer", time: "11:00 PM", pf: "2", f: "F4", dose: false },
  ];

  return plan.map((p, i) => {
    const isSetup = p.stage === "Setup";
    const isFirstDose = p.dose;
    const progress = p.stage === "Transfer" ? 2 : isFirstDose ? 0 : 1;
    const spGr = 1.056 - progress * 0.004 - (d % 3) * 0.001;
    const cell = 160 + progress * 80 + (i % 3) * 10;
    const level = 35 + progress * 28;
    const rs = 12.8 - progress * 1.5;
    const alc = 0.1 + progress * 0.85;
    return {
      view: "culturing",
      date: iso,
      stage: p.stage,
      time: p.time,
      timeH: p.time,
      pfNumber: p.pf,
      passFermenter: FERMENTERS[(d + i) % 6],
      spGr: round3(spGr),
      temp: round1(31.2 + progress * 0.4),
      ph: round2(5.15 - progress * 0.12),
      yeast: isFirstDose ? String(25 + (d % 4)) : "0",
      ga: isFirstDose ? "8" : isSetup ? "4" : "0",
      urea: isFirstDose ? "12" : isSetup ? "6" : "0",
      antiBiotic: isFirstDose ? "0.5" : "0",
      booster: isFirstDose ? "1.0" : isSetup ? "0.5" : "0",
      cellCount: String(cell),
      liveBuddingCell: String(Math.round(cell * 0.62)),
      liveSingleCells: String(Math.round(cell * 0.28)),
      levelPct: String(Math.min(95, level)),
      rsPct: round1(rs),
      alcPct: round1(alc),
      distillaseCs: isFirstDose ? "2.0" : isSetup ? "1.0" : "0",
      spenzyme: isFirstDose ? "1.5" : isSetup ? "0.8" : "0",
      promoterG: isFirstDose ? "0.8" : isSetup ? "0.4" : "0",
      sctLactroll: isFirstDose ? "0.4" : isSetup ? "0.2" : "0",
      smbs: isFirstDose ? "0.3" : isSetup ? "0.2" : "0",
      caustic: "0",
      acid: isFirstDose ? "1.2" : isSetup ? "0.6" : "0",
    };
  });
}

function fermenterRowsForDate(iso) {
  const d = dayIndex(iso);
  const times = ["6:00 AM", "10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"];
  const BATCH_H = 60;
  const GAP_H = 12;
  const CYCLE = BATCH_H + GAP_H;
  const rows = [];

  const hourOf = (timeStr) => {
    const t = String(timeStr);
    const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return 0;
    let h = Number(m[1]);
    const min = Number(m[2]);
    const ap = m[3].toUpperCase();
    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return h + min / 60;
  };

  for (let fi = 0; fi < FERMENTERS.length; fi++) {
    const fermenterNo = String(fi + 1);
    const stagger = fi * 10; // F1@0h, F2@10h, …
    for (let si = 0; si < times.length; si++) {
      const time = times[si];
      const absH = (d - 8) * 24 + hourOf(time);
      const t = absH - stagger;
      if (t < 0) continue;
      const inCycle = t % CYCLE;
      if (inCycle >= BATCH_H) continue; // CIP / idle gap
      const age = inCycle;
      const p = age / BATCH_H;
      const wave = Math.sin(p * Math.PI);
      const temp = 31.0 + wave * 2.4 + ((d + fi + si) % 3) * 0.1;
      const ph = 5.1 - p * 0.75 - ((fi + si) % 2) * 0.03;
      const rs = Math.max(0.4, 12.2 - p * 11.2);
      const g = 1.052 - p * 0.038;
      const dst = Math.max(0.15, 2.1 - p * 1.9);
      const vol = Math.min(98, 28 + p * 70);
      const ethanol = Math.max(0.3, (12.2 - rs) * 0.88);
      let status = "Reaction";
      if (age < 4) status = "Setup";
      else if (age < 10) status = "PF Transfer";
      else if (age < 18) status = "Filling";
      else if (age < 48) status = "Reaction";
      else status = "Retention";
      const dose = age < 14 || (age > 20 && age < 24);

      rows.push({
        view: "fermentation",
        date: iso,
        time,
        fermenterNo,
        status,
        volPct: String(Math.round(vol)),
        gravity: round3(g),
        rsPct: round1(rs),
        dstPct: round1(dst),
        ph: round2(ph),
        temperatureC: round1(temp),
        yeast: age < 6 ? String(15 + (d % 5)) : "0",
        urea: dose ? String(age < 6 ? 10 : 5 + (si % 3)) : "0",
        distillaseCs: dose ? round1(age < 6 ? 2.0 : 1.0) : "0",
        spenzyme: dose ? round1(age < 6 ? 1.2 : 0.6) : "0",
        promoterG: dose ? "0.5" : "0",
        sctLactroll: dose ? "0.3" : "0",
        smbs: dose ? "0.2" : "0",
        caustic: "0",
        acid: dose ? round1(age < 6 ? 1.0 : 0.5) : "0",
        ethanolPct: round1(ethanol),
        glycerolPct: round2(0.35 + p * 0.55 + ((d + fi) % 3) * 0.04),
        lacticAcidPct: round2(0.12 + p * 0.28 + (si % 3) * 0.03),
        aceticAcidPct: round2(0.05 + p * 0.18 + ((fi + si) % 2) * 0.02),
      });
    }
  }
  return rows;
}

function liquefactionHplcRowsForDate(iso, kind) {
  const d = dayIndex(iso);
  const isSlurry = kind === "hplcSlurry";
  return SHIFT_SLOTS.map((slot, i) => {
    const baseGlucose = isSlurry ? 8.5 + (i % 4) * 0.4 : 0.15 + (i % 3) * 0.05;
    const baseDp4 = isSlurry ? 4.2 + (i % 3) * 0.3 : 0.05 + (i % 2) * 0.02;
    const ethanol = isSlurry ? 0.3 + (i % 3) * 0.1 : 0.05;
    return {
      view: kind,
      date: iso,
      shift: slot.shift,
      time: slot.time,
      dp4Pct: round2(baseDp4 + (d % 3) * 0.05),
      dp3Pct: round2((isSlurry ? 2.8 : 0.04) + (i % 3) * 0.1),
      dp2Pct: round2((isSlurry ? 3.5 : 0.06) + (i % 4) * 0.12),
      glucosePct: round2(baseGlucose),
      fructosePct: round2((isSlurry ? 0.4 : 0.02) + (i % 2) * 0.05),
      lacticAcidPct: round2((isSlurry ? 0.25 : 0.01) + (i % 3) * 0.03),
      glycerolPct: round2((isSlurry ? 0.35 : 0.02) + (i % 2) * 0.04),
      aceticAcidPct: round2((isSlurry ? 0.12 : 0.01) + (i % 3) * 0.02),
      ethanolPct: round2(ethanol),
      passFermenter: passF(iso, i),
    };
  });
}

function prefermenterHplcRowsForDate(iso) {
  const d = dayIndex(iso);
  // Full day curve per pass fermenter so HPLC Trends / Comparison have 0→Final bins
  const times = ["6:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "10:00 PM"];
  const rows = [];
  for (let fi = 0; fi < FERMENTERS.length; fi++) {
    for (let si = 0; si < times.length; si++) {
      const p = si / (times.length - 1);
      const eth = 0.25 + p * 2.2 + (fi % 3) * 0.08;
      rows.push({
        view: "hplc",
        date: iso,
        time: times[si],
        timeH: times[si],
        pfNumber: String((fi % 2) + 1),
        passFermenter: FERMENTERS[fi],
        dp4PlusPct: round2(2.4 - p * 0.55 + (d % 2) * 0.08),
        dp4Pct: round2(1.7 - p * 0.35),
        dp3Pct: round2(2.0 - p * 0.4),
        dp2Pct: round2(2.5 - p * 0.55),
        dp1Pct: round2(Math.max(3.2, 7.2 - p * 3.2 + (fi % 2) * 0.15)),
        lacticAcidPct: round2(0.12 + p * 0.28 + (si % 3) * 0.02),
        glycerolPct: round2(0.28 + p * 0.45 + eth * 0.02),
        aceticAcidPct: round2(0.05 + p * 0.14 + (fi % 2) * 0.02),
        ethanolPct: round2(eth),
      });
    }
  }
  return rows;
}

function fermenterHplcRowsForDate(iso) {
  const d = dayIndex(iso);
  const times = ["6:00 AM", "10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"];
  const rows = [];
  for (let fi = 0; fi < FERMENTERS.length; fi++) {
    for (let si = 0; si < times.length; si++) {
      const p = ((d + fi + si) % 10) / 10;
      const eth = 1.2 + p * 9.5 + (fi % 3) * 0.3;
      rows.push({
        view: "hplc",
        date: iso,
        time: times[si],
        fermenterNo: String(fi + 1),
        dp4PlusPct: round2(1.8 + (si % 4) * 0.2 + (d % 2) * 0.1),
        dp4Pct: round2(1.1 + (si % 3) * 0.15),
        dp3Pct: round2(1.5 + (si % 4) * 0.12),
        dp2Pct: round2(2.0 + (si % 3) * 0.15),
        dp1Pct: round2(Math.max(1.2, 8.5 - p * 6)),
        lacticAcidPct: round2(0.15 + p * 0.35 + (si % 3) * 0.04),
        glycerolPct: round2(0.4 + p * 0.7 + eth * 0.015),
        aceticAcidPct: round2(0.08 + p * 0.22 + (fi % 2) * 0.03),
        ethanolPct: round2(eth),
      });
    }
  }
  return rows;
}

/**
 * Seed milling / liquefaction / prefermenter / fermenter for date range.
 * Replaces existing rows in that date window so re-seed is clean.
 */
export async function seedProcessRange(start, end, eachIsoFn) {
  const dates = eachIsoFn(start, end);

  await Promise.all([
    Milling.deleteMany({ date: { $gte: start, $lte: end } }),
    Liquefaction.deleteMany({ date: { $gte: start, $lte: end } }),
    Prefermenter.deleteMany({ date: { $gte: start, $lte: end } }),
    Fermenter.deleteMany({ date: { $gte: start, $lte: end } }),
  ]);

  const milling = [];
  const liq = [];
  const pf = [];
  const ferm = [];

  for (const iso of dates) {
    milling.push(...millingRowsForDate(iso));
    liq.push(...liquefactionRowsForDate(iso));
    liq.push(...liquefactionHplcRowsForDate(iso, "hplcWater"));
    liq.push(...liquefactionHplcRowsForDate(iso, "hplcSlurry"));
    pf.push(...prefermenterRowsForDate(iso));
    pf.push(...prefermenterHplcRowsForDate(iso));
    ferm.push(...fermenterRowsForDate(iso));
    ferm.push(...fermenterHplcRowsForDate(iso));
  }

  await Milling.insertMany(milling);
  await Liquefaction.insertMany(liq);
  await Prefermenter.insertMany(pf);
  await Fermenter.insertMany(ferm);

  const liqHplc = liq.filter((r) => r.view !== "liquefaction").length;
  const pfHplc = pf.filter((r) => r.view === "hplc").length;
  const fermHplc = ferm.filter((r) => r.view === "hplc").length;

  console.log(
    `  ✓ Process plant data ${start} → ${end}: milling ${milling.length}, liquefaction ${liq.length} (HPLC ${liqHplc}), prefermenter ${pf.length} (HPLC ${pfHplc}), fermenter ${ferm.length} (HPLC ${fermHplc})`
  );
}
