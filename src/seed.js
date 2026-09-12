import "dotenv/config";
import { connectDb } from "./db.js";
import { Inward } from "./models/Inward.js";
import { Outward } from "./models/Outward.js";
import { Milling } from "./models/Milling.js";
import { Liquefaction } from "./models/Liquefaction.js";
import { Prefermenter } from "./models/Prefermenter.js";
import { Fermenter } from "./models/Fermenter.js";
import { LabSampleRegister } from "./models/LabSampleRegister.js";
import { DistillationOperating } from "./models/DistillationOperating.js";
import { User } from "./models/User.js";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/distiller";

/** Default demo login — one user only. */
const DEFAULT_USER = {
  email: "admin@distilpro.com",
  password: "admin123",
  username: "admin",
  role: "admin",
  organizationName: "BioFuelPro Distillery",
};

const sampleInward = [
  {
    date: "2026-09-08",
    time: "09:15",
    vehicleNo: "MH-12-AB-4421",
    supplier: "Shree Vinayaka",
    grainType: "MAIZE",
    siloId: "SILO 1",
    grossWeight: "28.40",
    tareWeight: "9.10",
    netWeight: "19.30",
    moisturePct: "12.1",
    starchPct: "68.5",
    fmPct: "0.8",
    foreignMatterPct: "0.4",
    brokenSeedPct: "2.1",
    qcStatus: "ACCEPTED",
    batchNo: "B-9081",
    grnNo: "GRN-1001",
    chemistRemark: "OK",
    tokenId: "TKN-260908-001",
  },
  {
    date: "2026-09-08",
    time: "11:40",
    vehicleNo: "UP-78-CT-0581",
    supplier: "Ganga Traders",
    grainType: "BROKEN RICE",
    siloId: "SILO 2",
    grossWeight: "31.20",
    tareWeight: "10.05",
    netWeight: "21.15",
    moisturePct: "13.0",
    starchPct: "72.0",
    fmPct: "1.1",
    foreignMatterPct: "0.6",
    brokenSeedPct: "3.4",
    qcStatus: "ACCEPTED",
    batchNo: "B-9082",
    grnNo: "GRN-1002",
    chemistRemark: "",
    tokenId: "TKN-260908-002",
  },
];

const sampleOutward = [
  {
    section: "ethanol",
    date: "2026-09-08",
    time: "14:20",
    vehicleNo: "GJ-01-XX-9911",
    customer: "OM Oil Corp",
    product: "Ethanol",
    grade: "ENA",
    batchNo: "ETH-220",
    tankNo: "T-3",
    qtyKl: "20",
    strengthPct: "96.0",
    aaQtyKl: "19.2",
    qcStatus: "ACCEPTED",
    invoiceLrNo: "INV-4401",
    destination: "Vadodara",
    gateOutTime: "15:05",
    remarks: "Loaded",
  },
  {
    section: "ddgs",
    date: "2026-09-08",
    time: "16:10",
    vehicleNo: "RJ-14-CD-2201",
    customer: "Feed Mills Ltd",
    product: "DDGS",
    batchNo: "DDG-88",
    sourceSilo: "SILO 3",
    qtyMt: "18.5",
    moisturePct: "10.2",
    proteinPct: "28.0",
    qcStatus: "ACCEPTED",
    weighmentSlipNo: "WS-331",
    invoiceLrNo: "INV-4402",
    destination: "Jaipur",
    gateOutTime: "16:55",
    remarks: "",
  },
];

const sampleMilling = [
  {
    date: "2026-09-08",
    time: "7:00 AM",
    shift: "A",
    maize: "60",
    jowar: "0",
    brownRice: "40",
    um12: "2.1",
    um1: "4.5",
    um085: "8.2",
    um06: "18.0",
    um03: "22.4",
    finePowder: "44.8",
    starch: "68.2",
    passFermenter: "F1",
    remarks: "OK",
  },
  {
    date: "2026-09-08",
    time: "9:00 AM",
    shift: "A",
    maize: "55",
    jowar: "10",
    brownRice: "35",
    um12: "1.8",
    um1: "4.1",
    um085: "7.9",
    um06: "17.5",
    um03: "21.8",
    finePowder: "46.9",
    starch: "69.0",
    passFermenter: "F2",
    remarks: "",
  },
];

const sampleLiquefaction = [
  {
    view: "liquefaction",
    date: "2026-09-08",
    shift: "A",
    time: "08:00",
    flourTph: "12.5",
    thinSlopLph: "18000",
    processWaterLph: "4200",
    lessCondensateLph: "800",
    leesLph: "600",
    hotRate: "5600",
    slurryFlourRate: "1.05",
    enzymeBrand: "Novozymes",
    enzymeQty: "18",
    stTemp: "88",
    stLevel: "72",
    stSg: "1.085",
    stPh: "5.6",
    lt1Temp: "86",
    lt1Level: "68",
    lt1Sg: "1.082",
    lt1Ph: "5.5",
    lt2Temp: "84",
    lt2Level: "70",
    lt2Sg: "1.080",
    lt2Ph: "5.4",
    lt2Ds: "28.5",
    lt2Rs: "12.2",
    lt2Iodine: "NEGATIVE",
    passFermenter: "F1",
  },
  {
    view: "hplcWater",
    date: "2026-09-08",
    time: "10:00",
    dp4Pct: "2.1",
    dp3Pct: "3.4",
    dp2Pct: "8.8",
    glucosePct: "72.0",
    fructosePct: "1.2",
    lacticAcidPct: "0.4",
    glycerolPct: "0.8",
    aceticAcidPct: "0.2",
    ethanolPct: "0.1",
    passFermenter: "F1",
  },
];

const samplePrefermenter = [
  {
    view: "culturing",
    date: "2026-09-08",
    stage: "Setup",
    time: "08:00",
    pfNumber: "1",
    passFermenter: "F1",
    spGr: "1.060",
    temp: "32",
    ph: "4.8",
    yeast: "12",
    cellCount: "180",
    levelPct: "70",
    rsPct: "14.2",
    alcPct: "0.2",
  },
  {
    view: "culturing",
    date: "2026-09-08",
    stage: "Transfer",
    time: "14:00",
    pfNumber: "1",
    passFermenter: "F1",
    spGr: "1.040",
    temp: "33",
    ph: "4.5",
    yeast: "10",
    cellCount: "220",
    levelPct: "85",
    rsPct: "8.5",
    alcPct: "3.1",
  },
];

const sampleFermenter = [
  {
    view: "fermentation",
    date: "2026-09-08",
    time: "10:00",
    fermenterNo: "1",
    status: "Filling",
    volPct: "65",
    gravity: "1.055",
    rsPct: "12.8",
    dstPct: "1.2",
    ph: "4.6",
    temperatureC: "32.5",
    distillaseCs: "8",
    urea: "5",
    yeast: "12",
    spenzyme: "2.5",
    promoterG: "1.2",
    sctLactroll: "0.8",
    smbs: "1.5",
    caustic: "3",
    acid: "2",
  },
  {
    view: "fermentation",
    date: "2026-09-08",
    time: "18:00",
    fermenterNo: "1",
    status: "Reaction",
    volPct: "92",
    gravity: "1.020",
    rsPct: "4.5",
    dstPct: "0.6",
    ph: "4.2",
    temperatureC: "33.0",
    ethanolPct: "8.4",
  },
];

const sampleLabRegister = {
  date: "2026-09-08",
  meta: {
    plantUnit: "BioFuelPro Distillery",
    shift: "A",
    analysedBy: "Ramesh",
    reportNo: "LAB-908",
    pageNo: "1",
    pageOf: "1",
    reviewedBy: "Priya",
    generalRemarks: "Grain & slurry within limits.",
    checkedBy: "QC In-Charge",
    approvedBy: "QA Head",
    approvedAt: "2026-09-08 18:30",
  },
  grain: {
    moisture: { s0: "12.1", s1: "11.8", s2: "11.2", limits: "≤ 14", remarks: "OK" },
    starch: { s0: "68.5", s1: "68.8", s2: "69.0", limits: "≥ 68", remarks: "" },
    protein: { s0: "8.2", s1: "8.1", s2: "8.0", limits: "", remarks: "" },
  },
  slurry: {
    totalSolids: { s0: "28.5", s1: "27.8", s2: "26.0", limits: "", remarks: "" },
    ph: { s0: "5.6", s1: "5.4", s2: "4.8", limits: "4.5 – 5.8", remarks: "" },
    temperature: { s0: "88", s1: "84", s2: "32", limits: "", remarks: "" },
  },
  wash: {},
  distillation: {
    alcoholContent: { s0: "45.8", s1: "94.86", s2: "96.18", s3: "0.12", limits: "AA 95–96.5", remarks: "OK" },
  },
  evaporation: {
    brix: { s0: "1.042", s1: "1.048", s2: "1.045", s3: "", limits: "1.040 – 1.050", remarks: "" },
  },
  ddgs: {},
};

/** Default distillation operating param template + a few sample readings. */
const DISTILL_OP_DEFAULTS = [
  { section: "A", slNo: "1 A", particulars: "Wash feed flow", unit: "M3", target: "45–50", actual: "47.2" },
  { section: "A", slNo: "2 A", particulars: "Wash feed temp", unit: "°C", target: "67–69", actual: "68.1" },
  { section: "A", slNo: "3 A", particulars: "DG top temp", unit: "°C", target: "67–68", actual: "67.5" },
  { section: "A", slNo: "4 A", particulars: "Analyser column", unit: "°C", target: "70", actual: "70.0" },
  { section: "A", slNo: "5 A", particulars: "Analyser column", unit: "°C", target: "84–85", actual: "84.6" },
  { section: "A", slNo: "6 A", particulars: "Analyser column", unit: "Kg/Cm²", target: "0.420–0.450", actual: "0.435" },
  { section: "B", slNo: "1 B", particulars: "PRC Vacuum", unit: "Kg/Cm²", target: "0.30–0.35", actual: "0.32" },
  { section: "B", slNo: "2 B", particulars: "PRC Top temp", unit: "°C", target: "48–49", actual: "48.5" },
  { section: "B", slNo: "3 B", particulars: "PRC draw temp", unit: "°C", target: "49–50", actual: "49.4" },
  { section: "B", slNo: "4 B", particulars: "PRC LFO temp", unit: "°C", target: "53–55", actual: "54.0" },
  { section: "B", slNo: "5 B", particulars: "PRC HFO temp", unit: "°C", target: "65–67", actual: "66.1" },
  { section: "B", slNo: "6 B", particulars: "PRC feed temp", unit: "°C", target: "68–69", actual: "68.4" },
  { section: "B", slNo: "7 B", particulars: "PRC reflux feed", unit: "LPH", target: "15000–16000", actual: "15400" },
  { section: "B", slNo: "8 B", particulars: "PRC bottom temp", unit: "°C", target: "79–80", actual: "79.5" },
  { section: "C", slNo: "1 C", particulars: "Deheads column", unit: "Kg/Cm²", target: "0.32–0.35", actual: "0.33" },
  { section: "C", slNo: "2 C", particulars: "Top temp", unit: "°C", target: "41–42", actual: "41.5" },
  { section: "C", slNo: "3 C", particulars: "Reflux flow", unit: "LPH", target: "2700–3000", actual: "2850" },
  { section: "C", slNo: "4 C", particulars: "Bottom temp", unit: "°C", target: "67–69", actual: "68.0" },
  { section: "D", slNo: "1 D", particulars: "PC top pressure", unit: "Kg/Cm²", target: "1", actual: "1.00" },
  { section: "D", slNo: "2 D", particulars: "PC top temp", unit: "°C", target: "92–93", actual: "92.5" },
  { section: "D", slNo: "3 D", particulars: "PC feed temp", unit: "°C", target: "88–90", actual: "89.0" },
  { section: "D", slNo: "4 D", particulars: "RC lees flow (rec)", unit: "LPH", target: "22000–23000", actual: "22500" },
  { section: "D", slNo: "5 D", particulars: "PC DM water", unit: "LPH", target: "8000–10000", actual: "9000" },
  { section: "D", slNo: "6 D", particulars: "PC bottom temp", unit: "°C", target: "94–95", actual: "94.5" },
  { section: "D", slNo: "7 D", particulars: "PC steam flow", unit: "Kgs/Hr", target: "2500–2800", actual: "2650" },
  { section: "D", slNo: "8 D", particulars: "PC bottom press", unit: "Kg/Cm²", target: "1.51", actual: "1.51" },
  { section: "E", slNo: "1 E", particulars: "RC top pressure", unit: "Kg/Cm²", target: "2.3–2.5", actual: "2.40" },
  { section: "E", slNo: "2 E", particulars: "RC top temp", unit: "°C", target: "96–98", actual: "97.0" },
  { section: "E", slNo: "3 E", particulars: "RC draw temp", unit: "°C", target: "95–96", actual: "95.5" },
  { section: "E", slNo: "4 E", particulars: "RC LFO temp", unit: "°C", target: "98–99", actual: "98.5" },
  { section: "E", slNo: "5 E", particulars: "RC HFO temp", unit: "°C", target: "100–102", actual: "101.0" },
  { section: "E", slNo: "6 E", particulars: "RC feed temp", unit: "°C", target: "102–104", actual: "103.0" },
  { section: "E", slNo: "7 E", particulars: "RC reflux", unit: "LPH", target: "28000–29000", actual: "28500" },
  { section: "E", slNo: "8 E", particulars: "RC bottom temp", unit: "°C", target: "123–125", actual: "124.0" },
  { section: "E", slNo: "9 E", particulars: "RC bottom press", unit: "Kg/Cm²", target: "2.58–2.60", actual: "2.59" },
  { section: "E", slNo: "10 E", particulars: "RC steam flow", unit: "Kgs/Hr", target: "9600–9700", actual: "9650" },
  { section: "F", slNo: "1 F", particulars: "Simmering top p", unit: "Kg/Cm²", target: "1", actual: "1.00" },
  { section: "F", slNo: "2 F", particulars: "Top temp", unit: "°C", target: "71–72", actual: "71.5" },
  { section: "F", slNo: "3 F", particulars: "Reflux flow", unit: "LPH", target: "5500–6000", actual: "5750" },
  { section: "F", slNo: "4 F", particulars: "Bottom temp", unit: "°C", target: "80–82", actual: "81.0" },
  { section: "F", slNo: "5 F", particulars: "Bottom pressure", unit: "Kg/Cm²", target: "0.98–1.00", actual: "0.99" },
  { section: "G", slNo: "1 G", particulars: "FOC top pressure", unit: "Kg/Cm²", target: "2.2–2.3", actual: "2.25" },
  { section: "G", slNo: "2 G", particulars: "FOC top temp", unit: "°C", target: "98–99", actual: "98.5" },
  { section: "G", slNo: "3 G", particulars: "FOC Draw feed temp", unit: "°C", target: "87–88", actual: "87.5" },
  { section: "G", slNo: "4 G", particulars: "FOC LFO temp", unit: "°C", target: "102–104", actual: "103.0" },
  { section: "G", slNo: "5 G", particulars: "FOC HFO temp", unit: "°C", target: "106–109", actual: "107.5" },
  { section: "G", slNo: "6 G", particulars: "FOC Bottom temp", unit: "°C", target: "125–126", actual: "125.5" },
  { section: "G", slNo: "7 G", particulars: "FOC Bottom Pressure", unit: "Kg/Cm²", target: "2.5–2.7", actual: "2.60" },
  { section: "G", slNo: "8 G", particulars: "FOC Reflux flow", unit: "LPH", target: "2500–2600", actual: "2550" },
  { section: "G", slNo: "9 G", particulars: "FOC Steam flow", unit: "Kgs/Hr", target: "1100–1200", actual: "1150" },
];

const sampleDistillationOperating = {
  date: "2026-09-08",
  rows: DISTILL_OP_DEFAULTS.map((p, i) => ({
    id: `def-${p.section}-${i + 1}`,
    ...p,
  })),
};

async function main() {
  await connectDb(uri);
  await Promise.all([
    Inward.deleteMany({}),
    Outward.deleteMany({}),
    Milling.deleteMany({}),
    Liquefaction.deleteMany({}),
    Prefermenter.deleteMany({}),
    Fermenter.deleteMany({}),
    LabSampleRegister.deleteMany({}),
    DistillationOperating.deleteMany({}),
    User.deleteMany({}),
  ]);
  await User.create(DEFAULT_USER);
  await Inward.insertMany(sampleInward);
  await Outward.insertMany(sampleOutward);
  await Milling.insertMany(sampleMilling);
  await Liquefaction.insertMany(sampleLiquefaction);
  await Prefermenter.insertMany(samplePrefermenter);
  await Fermenter.insertMany(sampleFermenter);
  await LabSampleRegister.create(sampleLabRegister);
  await DistillationOperating.create(sampleDistillationOperating);
  console.log(
    `Seeded login=${DEFAULT_USER.email} / ${DEFAULT_USER.password} | inward=${sampleInward.length} outward=${sampleOutward.length} milling=${sampleMilling.length} liquefaction=${sampleLiquefaction.length} prefermenter=${samplePrefermenter.length} fermenter=${sampleFermenter.length} labRegister=1 distillationOperating=1`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
