import "dotenv/config";
import { connectDb } from "./db.js";
import { User } from "./models/User.js";
import { StoreSheet } from "./models/StoreSheet.js";
import { seedProcessRange } from "./seedProcess.js";
import { seedLabRegisterRange } from "./seedLabRegister.js";
import { seedDistillationOperatingRange } from "./seedDistillationOperating.js";
import { seedDprRange } from "./seedDpr.js";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/distiller";

const USERS = [
  {
    email: "admin@distilpro.com",
    password: "admin123",
    username: "admin",
    role: "admin",
    organizationName: "BioFuelPro Distillery",
  },
  {
    email: "user@distilpro.com",
    password: "user123",
    username: "user",
    role: "user",
    organizationName: "BioFuelPro Distillery",
  },
];

const START = "2026-09-08";
const END = "2026-09-22";

const SUPPLIERS = [
  "AgriChem Pvt Ltd",
  "GrainBio Supplies",
  "EnzymeTech India",
  "NovaYeast Traders",
  "ChemPure India",
];

const VEHICLES = ["MH12AB1234", "MH14CD5678", "MH16EF9012", "GJ01GH3456", "RJ14JK7890"];

/** Ethanol plant item master — all columns filled. */
const CATALOG = [
  {
    itemCode: "ST-EN-0088",
    itemName: "Glucoamylase",
    category: "Enzymes",
    specification: "Food-grade, 100000 U/g",
    unit: "KG",
    minStock: "50",
    maxStock: "400",
    reorderQty: "100",
    location: "STORE",
    shelfLifeDays: "180",
    status: "Active",
    remark: "Saccharification enzyme",
    qty: "120",
    value: "86400",
    dept: "Fermentation",
  },
  {
    itemCode: "ST-EN-0019",
    itemName: "Alpha Amylase",
    category: "Enzymes",
    specification: "Thermo-stable liquefaction",
    unit: "KG",
    minStock: "20",
    maxStock: "150",
    reorderQty: "40",
    location: "STORE",
    shelfLifeDays: "180",
    status: "Active",
    remark: "Liquefaction enzyme",
    qty: "80",
    value: "56000",
    dept: "Liquefaction",
  },
  {
    itemCode: "ST-AD-0042",
    itemName: "Active Dry Yeast",
    category: "ADY (Yeast)",
    specification: "S. cerevisiae ethanol strain",
    unit: "KG",
    minStock: "25",
    maxStock: "120",
    reorderQty: "50",
    location: "STORE",
    shelfLifeDays: "90",
    status: "Active",
    remark: "Prefermenter / fermenter",
    qty: "50",
    value: "42500",
    dept: "Fermentation",
  },
  {
    itemCode: "ST-CH-0115",
    itemName: "Caustic Soda",
    category: "Chemicals",
    specification: "Flakes 99%",
    unit: "KG",
    minStock: "40",
    maxStock: "200",
    reorderQty: "80",
    location: "STORE",
    shelfLifeDays: "730",
    status: "Active",
    remark: "CIP / cleaning",
    qty: "200",
    value: "18000",
    dept: "Distillery",
  },
  {
    itemCode: "ST-CH-0067",
    itemName: "Antifoam",
    category: "Chemicals",
    specification: "Food-grade silicone",
    unit: "KG",
    minStock: "15",
    maxStock: "80",
    reorderQty: "40",
    location: "STORE",
    shelfLifeDays: "365",
    status: "Active",
    remark: "Fermenter foam control",
    qty: "10",
    value: "12000",
    dept: "Fermentation",
  },
  {
    itemCode: "ST-LB-0021",
    itemName: "Lab Buffer Pack",
    category: "Lab Chemicals",
    specification: "pH 4.0 / 7.0 / 9.0",
    unit: "NOS",
    minStock: "8",
    maxStock: "40",
    reorderQty: "12",
    location: "LAB",
    shelfLifeDays: "365",
    status: "Active",
    remark: "Lab calibration",
    qty: "12",
    value: "9600",
    dept: "Laboratory",
  },
  {
    itemCode: "ST-ME-0142",
    itemName: "Pump Seal Kit",
    category: "Mechanical Parts",
    specification: "Compatible pump model PX-200",
    unit: "SET",
    minStock: "20",
    maxStock: "80",
    reorderQty: "24",
    location: "MAINTENANCE",
    shelfLifeDays: "1095",
    status: "Active",
    remark: "Maintenance spare",
    qty: "12",
    value: "36000",
    dept: "Maintenance",
  },
  {
    itemCode: "ST-PK-0311",
    itemName: "ENA Drum 200 L",
    category: "Packaging",
    specification: "HDPE food-grade drum",
    unit: "NOS",
    minStock: "30",
    maxStock: "200",
    reorderQty: "50",
    location: "PACKAGING",
    shelfLifeDays: "1825",
    status: "Active",
    remark: "Finished goods packing",
    qty: "64",
    value: "51200",
    dept: "Packaging",
  },
  {
    itemCode: "ST-OT-0008",
    itemName: "Urea Prills",
    category: "Others",
    specification: "Fertilizer grade nutrient",
    unit: "MT",
    minStock: "2",
    maxStock: "20",
    reorderQty: "5",
    location: "STORE",
    shelfLifeDays: "730",
    status: "Active",
    remark: "Fermentation nutrient",
    qty: "6",
    value: "48000",
    dept: "Fermentation",
  },
];

function eachIso(start, end) {
  const out = [];
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = end.split("-").map(Number);
  const cur = new Date(ys, ms - 1, ds);
  const last = new Date(ye, me - 1, de);
  while (cur <= last) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function stamp(iso) {
  return iso.replace(/-/g, "").slice(2);
}

function addDaysIso(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function daysBetween(fromIso, toIso) {
  const [y1, m1, d1] = fromIso.split("-").map(Number);
  const [y2, m2, d2] = toIso.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function itemForDay(day) {
  return pick(CATALOG, day);
}

/** Time must be "h:mm AM/PM" for DistillerTimePicker. */
function timeAt(hour12, minute, period) {
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function itemsRows(iso) {
  return CATALOG.map((item, i) => ({
    id: `seed-itm-${iso}-${i + 1}`,
    slNo: i + 1,
    date: iso,
    itemCode: item.itemCode,
    itemName: item.itemName,
    category: item.category,
    specification: item.specification,
    unit: item.unit,
    minStock: item.minStock,
    maxStock: item.maxStock,
    reorderQty: item.reorderQty,
    location: item.location,
    shelfLifeDays: item.shelfLifeDays,
    status: item.status,
    remark: item.remark,
  }));
}

function indentRows(iso) {
  const s = stamp(iso);
  const day = Number(iso.slice(-2));
  const item = itemForDay(day);
  return [
    {
      id: `seed-ind-${iso}-1`,
      slNo: 1,
      date: iso,
      time: timeAt(8, 30, "AM"),
      indentNo: `IND-${s}-001`,
      department: item.dept,
      requestedBy: "Plant Operator",
      itemCode: item.itemCode,
      itemName: item.itemName,
      qty: String(Math.max(5, Math.floor(Number(item.qty) / 4))),
      unit: item.unit,
      requiredDate: addDaysIso(iso, 1),
      priority: day % 3 === 0 ? "Urgent" : "Normal",
      status: "Approved",
      remark: `Process requirement — ${item.dept}`,
    },
  ];
}

function grnRows(iso) {
  const s = stamp(iso);
  const day = Number(iso.slice(-2));
  const item = itemForDay(day);
  return [
    {
      id: `seed-grn-${iso}-1`,
      slNo: 1,
      date: iso,
      time: timeAt(10, 0, "AM"),
      grnNo: `GRN-${s}-001`,
      supplier: pick(SUPPLIERS, day),
      invoiceNo: `INV-${iso.replace(/-/g, "")}`,
      vehicleNo: pick(VEHICLES, day),
      itemCode: item.itemCode,
      itemName: item.itemName,
      qty: item.qty,
      unit: item.unit,
      batch: `B-${s}`,
      expiryDate: addDaysIso(iso, Number(item.shelfLifeDays) || 180),
      value: item.value,
      status: "Accepted",
      remark: "Invoiced goods receipt — Accepted",
    },
  ];
}

function stockRows(iso) {
  const day = Number(iso.slice(-2));
  const item = itemForDay(day);
  const qtyIn = Number(item.qty) || 0;
  const qtyOut = Math.max(5, Math.floor(qtyIn / 4));
  const balance = Math.max(0, qtyIn - qtyOut);
  const min = Number(item.minStock) || 0;
  let status = "Normal";
  if (balance <= 0) status = "Out";
  else if (balance < min) status = "Low";
  return [
    {
      id: `seed-stk-${iso}-1`,
      slNo: 1,
      date: iso,
      time: timeAt(10, 30, "AM"),
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      qtyIn: String(qtyIn),
      qtyOut: String(qtyOut),
      balance: String(balance),
      unit: item.unit,
      location: item.location,
      status,
      operator: "Store Keeper",
      remark: "Daily inward / issue balance",
    },
  ];
}

function issueRows(iso) {
  const s = stamp(iso);
  const day = Number(iso.slice(-2));
  const item = itemForDay(day);
  const qty = String(Math.max(5, Math.floor(Number(item.qty) / 4)));
  return [
    {
      id: `seed-iss-${iso}-1`,
      slNo: 1,
      date: iso,
      time: timeAt(2, 0, "PM"),
      issueNo: `ISS-${s}-001`,
      indentNo: `IND-${s}-001`,
      issuedTo: item.dept,
      itemCode: item.itemCode,
      itemName: item.itemName,
      qty,
      unit: item.unit,
      location: "STORE",
      issuedBy: "Store Keeper",
      status: "Issued",
      remark: `Issued against indent to ${item.dept}`,
    },
  ];
}

function deptToLocation(dept) {
  const map = {
    Milling: "MILLING",
    Liquefaction: "FERMENTATION",
    Fermentation: "FERMENTATION",
    Distillery: "DISTILLERY",
    Laboratory: "LAB",
    Maintenance: "MAINTENANCE",
    Packaging: "PACKAGING",
    Boiler: "STORE",
  };
  return map[dept] || "STORE";
}

function transferRows(iso) {
  const s = stamp(iso);
  const day = Number(iso.slice(-2));
  const item = itemForDay(day);
  return [
    {
      id: `seed-trf-${iso}-1`,
      slNo: 1,
      date: iso,
      time: timeAt(11, 15, "AM"),
      transferNo: `TRF-${s}-001`,
      itemCode: item.itemCode,
      itemName: item.itemName,
      fromLoc: "STORE",
      toLoc: deptToLocation(item.dept),
      qty: String(Math.max(2, Math.floor(Number(item.qty) / 10))),
      unit: item.unit,
      transferredBy: "Store Keeper",
      status: "Received",
      remark: "Location transfer for process use",
    },
  ];
}

function adjustmentRows(iso) {
  const s = stamp(iso);
  const day = Number(iso.slice(-2));
  const item = itemForDay(day);
  const book = Number(item.qty) || 0;
  const physical = book - (day % 3);
  return [
    {
      id: `seed-adj-${iso}-1`,
      slNo: 1,
      date: iso,
      time: timeAt(4, 30, "PM"),
      adjNo: `ADJ-${s}-001`,
      itemCode: item.itemCode,
      itemName: item.itemName,
      bookQty: String(book),
      physicalQty: String(physical),
      unit: item.unit,
      reason: day % 2 === 0 ? "Physical count" : "Spillage",
      approvedBy: "Store Incharge",
      status: "Posted",
      remark: "Seeded stock adjustment",
    },
  ];
}

function alertsRows(iso) {
  const lowItems = CATALOG.filter((item) => Number(item.qty) < Number(item.minStock) * 1.2).slice(0, 4);
  const list = lowItems.length ? lowItems : CATALOG.slice(0, 3);
  return list.map((item, i) => ({
    id: `seed-alt-${iso}-${i + 1}`,
    slNo: i + 1,
    date: iso,
    itemCode: item.itemCode,
    itemName: item.itemName,
    category: item.category,
    currentStock: String(Math.min(Number(item.qty), Number(item.minStock) - 1)),
    minStock: item.minStock,
    reorderQty: item.reorderQty,
    unit: item.unit,
    remark: "Below reorder — raise indent",
  }));
}

function expiryRows(iso) {
  return CATALOG.slice(0, 5).map((item, i) => {
    const daysLeft = 10 + i * 7;
    const expiryDate = addDaysIso(iso, daysLeft);
    return {
      id: `seed-exp-${iso}-${i + 1}`,
      slNo: i + 1,
      date: iso,
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      batch: `B-${stamp(iso)}-${i + 1}`,
      expiryDate,
      qty: item.qty,
      unit: item.unit,
      daysLeft: String(daysBetween(iso, expiryDate)),
      remark: daysLeft <= 30 ? "FEFO — issue soon" : "Monitor shelf life",
    };
  });
}

async function upsertSheet(sheetType, date, rows) {
  await StoreSheet.findOneAndUpdate(
    { sheetType, date },
    { $set: { sheetType, date, rows } },
    { upsert: true, new: true }
  );
}

async function seedStoreRange() {
  const dates = eachIso(START, END);
  let upserts = 0;
  for (const iso of dates) {
    const batches = [
      ["items", itemsRows(iso)],
      ["indent", indentRows(iso)],
      ["grn", grnRows(iso)],
      ["stock", stockRows(iso)],
      ["issue", issueRows(iso)],
      ["transfer", transferRows(iso)],
      ["adjustment", adjustmentRows(iso)],
      ["alerts", alertsRows(iso)],
      ["expiry", expiryRows(iso)],
    ];
    for (const [sheetType, rows] of batches) {
      await upsertSheet(sheetType, iso, rows);
      upserts += 1;
    }
  }
  console.log(`  ✓ Store all sheets seeded ${START} → ${END} (${upserts} sheets, full columns)`);
}

async function main() {
  await connectDb(uri);

  await User.deleteMany({ email: "admin@biofuelpro.com" });

  for (const u of USERS) {
    await User.findOneAndUpdate({ email: u.email }, { $set: u }, { upsert: true, new: true });
    console.log(`  ✓ ${u.email} / ${u.password}  (${u.role})`);
  }

  await seedStoreRange();
  await seedProcessRange(START, END, eachIso);
  await seedLabRegisterRange(START, END, eachIso);
  await seedDistillationOperatingRange(START, END, eachIso);
  await seedDprRange(START, END, eachIso);

  console.log("\nSeeded DistilPro users + store + process + laboratory + distillation + DPR (DB).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
