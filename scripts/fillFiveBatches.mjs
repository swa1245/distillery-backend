import "dotenv/config";
import mongoose from "mongoose";
import { ProcessBatch } from "../src/models/ProcessBatch.js";
import { Milling } from "../src/models/Milling.js";
import { Liquefaction } from "../src/models/Liquefaction.js";
import { Prefermenter } from "../src/models/Prefermenter.js";
import { Fermenter } from "../src/models/Fermenter.js";

const PLANS = [
  { startDate: "2026-09-21", fermenter: "F1", durationHours: 30 },
  { startDate: "2026-09-22", fermenter: "F2", durationHours: 40 },
  { startDate: "2026-09-23", fermenter: "F3", durationHours: 60 },
  { startDate: "2026-09-24", fermenter: "F4", durationHours: 90 },
  { startDate: "2026-09-27", fermenter: "F5", durationHours: 30 },
];

function batchIdOf(startDate, fermenter) {
  const [yyyy, mm, dd] = startDate.split("-");
  return `${dd}-${mm}-${yyyy}-${fermenter}`;
}

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatClock(date) {
  let h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ap}`;
}

function shiftFor(date) {
  const hour = date.getHours();
  if (hour >= 7 && hour < 15) return "A";
  if (hour >= 15 && hour < 23) return "B";
  return "C";
}

function readingTimes(startDate, durationHours, { throughEnd = false } = {}) {
  const [y, m, d] = startDate.split("-").map(Number);
  const start = new Date(y, m - 1, d, 7, 0, 0, 0);
  const rows = [];
  const last = throughEnd ? durationHours : durationHours - 0.001;
  for (let hours = 0; hours <= last; hours += 2) {
    const dt = new Date(start.getTime() + hours * 60 * 60 * 1000);
    rows.push({ date: isoDate(dt), time: formatClock(dt), shift: shiftFor(dt), hour: hours });
  }
  return rows;
}

function r1(n) {
  return (Math.round(n * 10) / 10).toFixed(1);
}

function r2(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function r3(n) {
  return (Math.round(n * 1000) / 1000).toFixed(3);
}

const GRIND = [
  { um12: 2.4, um1: 5.6, um085: 18.0, um06: 24.0, um03: 20.0, maize: 80, jowar: 12, rice: 8 },
  { um12: 4.2, um1: 9.8, um085: 14.0, um06: 20.0, um03: 18.0, maize: 55, jowar: 30, rice: 15 },
  { um12: 1.4, um1: 4.6, um085: 22.0, um06: 30.0, um03: 22.0, maize: 70, jowar: 8, rice: 22 },
  { um12: 8.0, um1: 14.0, um085: 12.0, um06: 18.0, um03: 18.0, maize: 48, jowar: 32, rice: 20 },
  { um12: 1.2, um1: 2.8, um085: 10.0, um06: 14.0, um03: 16.0, maize: 88, jowar: 6, rice: 6 },
];

function millingRow(slot, i, fermenter, batchId, profileIndex) {
  const grind = GRIND[profileIndex] || GRIND[0];
  const wobble = ((i % 3) - 1) * 0.2;
  const maize = grind.maize;
  const um12 = grind.um12 + wobble;
  const um1 = grind.um1 + wobble;
  const um085 = grind.um085 + wobble;
  const um06 = grind.um06 + wobble;
  const um03 = grind.um03 + wobble;
  const fine = Math.max(8, 100 - um12 - um1 - um085 - um06 - um03);
  return {
    date: slot.date,
    time: slot.time,
    shift: slot.shift,
    maize: r1(maize),
    jowar: r1(grind.jowar),
    brownRice: r1(grind.rice),
    um12: r1(um12),
    um1: r1(um1),
    um085: r1(um085),
    um06: r1(um06),
    um03: r1(um03),
    mesh1180_0850: r1(um12 + um085),
    mesh0600_0300: r1(um06 + um03),
    finePowder: r1(fine),
    starch: r1(63.4 + (i % 6) * 0.25),
    passFermenter: fermenter,
    batchId,
    remarks: "",
  };
}

function liquefactionRow(slot, i, fermenter, batchId) {
  const flour = 12.3 + (i % 5) * 0.22;
  const thin = 1780 + i * 8;
  const pw = 4180 + i * 12;
  const cond = 1080 + (i % 6) * 15;
  const lees = 340 + (i % 4) * 12;
  const drift = (i % 12) * 0.04;
  return {
    view: "liquefaction",
    date: slot.date,
    time: slot.time,
    shift: slot.shift,
    flourTph: r1(flour),
    thinSlopLph: String(thin),
    processWaterLph: String(pw),
    lessCondensateLph: String(cond),
    leesLph: String(lees),
    hotRate: String(pw + cond + lees),
    slurryFlourRate: r2(flour * 0.92),
    enzymeBrand: "Alpha-Amylase Thermo",
    enzymeQty: r1(flour * 0.35),
    stTemp: r1(86.5 + (i % 3) * 0.4),
    stLevel: String(64 + (i % 5)),
    stSg: r3(1.082 + (i % 4) * 0.001),
    stPh: r2(5.52 + (i % 3) * 0.04 - drift),
    lt1Temp: r1(70.5 + (i % 3) * 0.3),
    lt1Level: String(68 + (i % 4)),
    lt1Sg: r3(1.075 + (i % 3) * 0.001),
    lt1Ph: r2(5.32 + (i % 2) * 0.04),
    lt2Temp: r1(60.8 + (i % 2) * 0.4),
    lt2Level: String(72 + (i % 5)),
    lt2Sg: r3(1.07 + (i % 3) * 0.001),
    lt2Ph: r2(5.16 + (i % 3) * 0.03),
    lt2Ds: r1(27.6 + (i % 4) * 0.25),
    lt2Rs: r1(1.9 + (i % 3) * 0.15),
    lt2Iodine: "NEGATIVE",
    passFermenter: fermenter,
    batchId,
  };
}

function prefermenterRow(slot, i, count, fermenter, batchId) {
  const progress = count <= 1 ? 0 : i / (count - 1);
  const isFirst = i === 0;
  const isLast = i === count - 1;
  const isSetup = isFirst;
  const stage = isFirst ? "Setup" : isLast ? "Transfer" : "Reaction";
  const cell = isLast ? 250 : 0;
  const pf = fermenter === "F2" || fermenter === "F4" || fermenter === "F6" ? "2" : "1";
  return {
    view: "culturing",
    date: slot.date,
    stage,
    time: slot.time,
    timeH: slot.time,
    pfNumber: pf,
    passFermenter: fermenter,
    batchId,
    spGr: r3(1.056 - progress * 0.01),
    temp: r1(31.2 + progress * 1.1),
    ph: r2(5.15 - progress * 0.28),
    yeast: isFirst ? "26" : "0",
    ga: isFirst ? "8" : isSetup ? "4" : "0",
    urea: isFirst ? "12" : isSetup ? "6" : "0",
    antiBiotic: isFirst ? "0.5" : "0",
    booster: isFirst ? "1.0" : isSetup ? "0.5" : "0",
    cellCount: String(cell),
    liveBuddingCell: isLast ? "155" : "0",
    liveSingleCells: isLast ? "70" : "0",
    levelPct: String(Math.min(95, Math.round(35 + progress * 55))),
    rsPct: r1(12.8 - progress * 3.2),
    alcPct: r1(0.1 + progress * 1.8),
    distillaseCs: isFirst ? "2.0" : isSetup ? "1.0" : "0",
    spenzyme: isFirst ? "1.5" : isSetup ? "0.8" : "0",
    promoterG: isFirst ? "0.8" : isSetup ? "0.4" : "0",
    sctLactroll: isFirst ? "0.4" : isSetup ? "0.2" : "0",
    smbs: isFirst ? "0.3" : isSetup ? "0.2" : "0",
    mgso4: isFirst ? "0.6" : isSetup ? "0.3" : "0",
    nutroboost: isFirst ? "0.5" : isSetup ? "0.2" : "0",
    aceticAcidPct: r2(0.06 + progress * 0.18),
    caustic: "0",
    acid: isFirst ? "1.2" : isSetup ? "0.6" : "0",
  };
}

function liqHplcRow(slot, i, count, fermenter, batchId, view) {
  const progress = count <= 1 ? 0 : i / (count - 1);
  const slurry = view === "hplcSlurry";
  return {
    view,
    date: slot.date,
    time: slot.time,
    shift: slot.shift,
    batchId,
    passFermenter: fermenter,
    dp4Pct: r2(slurry ? 44 - progress * 10 : 16 - progress * 5),
    dp3Pct: r2(slurry ? 18 - progress * 4 : 11 - progress * 2),
    dp2Pct: r2(slurry ? 15 - progress * 3 : 20 + progress * 3),
    glucosePct: r2(slurry ? 7 + progress * 8 : 26 + progress * 12),
    fructosePct: r2(slurry ? 0.35 + progress * 0.4 : 1.1 + progress * 0.6),
    lacticAcidPct: r2(0.12 + progress * 0.22),
    glycerolPct: r2(0.25 + progress * 0.3),
    aceticAcidPct: r2(0.04 + progress * 0.1),
    ethanolPct: r2(slurry ? 0.08 + progress * 0.25 : 0.15 + progress * 0.45),
  };
}

function fermenterStatus(i, count, hour, durationHours) {
  if (i === 0) return "Setup";
  if (hour < 6) return "PF Transfer";
  if (hour < 12) return "Filling";
  if (i === count - 1 || hour >= durationHours - 4) return "Retention";
  return "Reaction";
}

function fermenterRow(slot, i, count, fermenter, batchId, durationHours) {
  const progress = count <= 1 ? 0 : i / (count - 1);
  const early = progress < 0.18;
  const isLast = i === count - 1;
  const level = Math.min(98, Math.round(24 + progress * 72));
  const tank = Number(String(fermenter).replace(/\D/g, "")) || 1;
  return {
    view: "fermentation",
    date: slot.date,
    time: slot.time,
    batchId,
    fermenterNo: fermenter,
    status: fermenterStatus(i, count, slot.hour, durationHours),
    levelPct: String(level),
    volume: String(Math.round(70 + progress * 230)),
    volPct: String(level),
    gravity: r3(1.078 - progress * 0.064),
    ph: r2(5.08 - progress * 0.58),
    temperatureC: r1(31.2 + Math.sin(progress * Math.PI) * 2.4),
    rsPct: isLast ? r1(0.7 + tank * 0.08) : "",
    dstPct: isLast ? r2(0.22 + tank * 0.04) : "",
    ethanolPct: isLast ? r1(11.1 + tank * 0.15) : "",
    va: isLast ? r2(0.16 + tank * 0.02) : "",
    aceticAcidPct: isLast ? r2(0.16 + tank * 0.02) : "",
    yeast: i === 0 ? "18" : "0",
    urea: early ? (i === 0 ? "10" : "4") : "0",
    distillaseCs: early ? (i === 0 ? "2.0" : "1.0") : "0",
    promoterG: early ? "0.5" : "0",
    sctLactroll: early ? "0.3" : "0",
    nutroboost: early ? "0.4" : "0",
    aquzymeLiq: early ? "0.6" : "0",
    smbs: early ? "0.2" : "0",
  };
}

function fermenterHplcRow(slot, i, count, fermenter, batchId) {
  const progress = count <= 1 ? 0 : i / (count - 1);
  return {
    view: "hplc",
    date: slot.date,
    time: slot.time,
    batchId,
    fermenterNo: fermenter,
    dp4PlusPct: r2(8.4 - progress * 5.2),
    dp4Pct: r2(5.6 - progress * 3.1),
    dp3Pct: r2(9.8 - progress * 4.4),
    dp2Pct: r2(16.5 - progress * 8.0),
    dp1Pct: r2(22.0 - progress * 14.0),
    lacticAcidPct: r2(0.14 + progress * 0.55),
    glycerolPct: r2(0.32 + progress * 1.4),
    aceticAcidPct: r2(0.05 + progress * 0.28),
    ethanolPct: r2(0.2 + progress * 11.4),
  };
}

function prefermenterHplcRow(slot, i, count, fermenter, batchId) {
  const progress = count <= 1 ? 0 : i / (count - 1);
  const pf = fermenter === "F2" || fermenter === "F4" || fermenter === "F6" ? "2" : "1";
  return {
    view: "hplc",
    date: slot.date,
    time: slot.time,
    timeH: slot.time,
    pfNumber: pf,
    passFermenter: fermenter,
    batchId,
    dp4PlusPct: r2(9.2 - progress * 3.4),
    dp4Pct: r2(6.4 - progress * 2.1),
    dp3Pct: r2(11.5 - progress * 3.6),
    dp2Pct: r2(19.0 - progress * 6.5),
    dp1Pct: r2(24.0 - progress * 8.0),
    lacticAcidPct: r2(0.18 + progress * 0.4),
    glycerolPct: r2(0.35 + progress * 0.9),
    aceticAcidPct: r2(0.07 + progress * 0.22),
    ethanolPct: r2(0.15 + progress * 2.6),
  };
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

await mongoose.connect(uri);

const millingDocs = [];
const liqDocs = [];
const prefermenterDocs = [];
const fermenterDocs = [];
const batchDocs = [];

for (const plan of PLANS) {
  const batchId = batchIdOf(plan.startDate, plan.fermenter);
  batchDocs.push({
    batchId,
    startDate: plan.startDate,
    fermenter: plan.fermenter,
    durationHours: plan.durationHours,
  });
  const slots = readingTimes(plan.startDate, 12, { throughEnd: true });
  const fermSlots = readingTimes(plan.startDate, plan.durationHours, { throughEnd: true });
  slots.forEach((slot, i) => {
    millingDocs.push(millingRow(slot, i, plan.fermenter, batchId, PLANS.indexOf(plan)));
    liqDocs.push(liquefactionRow(slot, i, plan.fermenter, batchId));
    liqDocs.push(liqHplcRow(slot, i, slots.length, plan.fermenter, batchId, "hplcWater"));
    liqDocs.push(liqHplcRow(slot, i, slots.length, plan.fermenter, batchId, "hplcSlurry"));
    prefermenterDocs.push(prefermenterRow(slot, i, slots.length, plan.fermenter, batchId));
    prefermenterDocs.push(prefermenterHplcRow(slot, i, slots.length, plan.fermenter, batchId));
  });
  fermSlots.forEach((slot, i) => {
    fermenterDocs.push(fermenterRow(slot, i, fermSlots.length, plan.fermenter, batchId, plan.durationHours));
    fermenterDocs.push(fermenterHplcRow(slot, i, fermSlots.length, plan.fermenter, batchId));
  });
  console.log(`${batchId}  ${slots.length} short logs, ${fermSlots.length} fermenter readings over ${plan.durationHours}h`);
}

const ids = batchDocs.map((b) => b.batchId);
await ProcessBatch.deleteMany({ batchId: { $in: ids } });
await Milling.deleteMany({ batchId: { $in: ids } });
await Liquefaction.deleteMany({ batchId: { $in: ids } });
await Prefermenter.deleteMany({
  batchId: { $in: ids },
  view: { $in: ["culturing", "hplc"] },
});
await ProcessBatch.insertMany(batchDocs);
await Milling.insertMany(millingDocs);
await Liquefaction.insertMany(liqDocs);
await Prefermenter.insertMany(prefermenterDocs);
await Fermenter.deleteMany({});
await Fermenter.insertMany(fermenterDocs);

console.log(
  `saved batches ${batchDocs.length}, milling ${millingDocs.length}, liquefaction ${liqDocs.length}, prefermenter ${prefermenterDocs.length}, fermenter ${fermenterDocs.length}`
);
await mongoose.disconnect();
