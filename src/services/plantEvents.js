import { PlantEvent } from "../models/PlantEvent.js";

function has(v) {
  const s = String(v ?? "").trim();
  return s !== "" && s !== "-";
}

function changedToValue(before, after, key) {
  return has(after?.[key]) && !has(before?.[key]);
}

function qcVerdict(row) {
  const raw = String(row?.qcStatus || "").trim().toUpperCase();
  if (raw === "PASS" || raw === "ACCEPTED") return "ACCEPTED";
  if (raw === "FAIL" || raw === "REJECTED") return "REJECTED";
  return "";
}

const QC_FIELDS = ["moisturePct", "starchPct", "fmPct", "foreignMatterPct", "brokenSeedPct"];

function idOf(doc) {
  return doc?._id ? String(doc._id) : String(doc?.id || "");
}

/** Persist events; never fails the originating request. */
export async function recordPlantEvents(events) {
  const list = (events || []).filter(Boolean);
  if (!list.length) return;
  try {
    await PlantEvent.insertMany(list.map((e) => ({ at: new Date(), ...e })));
  } catch (err) {
    console.error("plant event log failed:", err.message);
  }
}

export function inwardEvents(before, after) {
  if (!after) return [];
  const base = {
    entityType: "inward",
    entityId: idOf(after),
    vehicleNo: String(after.vehicleNo || ""),
    refNo: String(after.tokenId || after.grnNo || ""),
    date: String(after.date || ""),
  };
  const label = after.vehicleNo || "Vehicle";
  const out = [];
  if (!before && (has(after.vehicleNo) || has(after.supplier))) {
    out.push({
      ...base,
      type: "GATE_ENTRY_COMPLETED",
      zone: "gate",
      message: `${label} entered gate${after.grainType ? ` · ${after.grainType}` : ""}${after.supplier ? ` · ${after.supplier}` : ""}`,
    });
  }
  const grossNew = changedToValue(before, after, "grossWeight");
  const tareNew = changedToValue(before, after, "tareWeight");
  if (grossNew && !has(after.tareWeight)) {
    out.push({ ...base, type: "WEIGHBRIDGE_STARTED", zone: "weighbridge", message: `${label} gross weight ${after.grossWeight}` });
  }
  if ((grossNew || tareNew) && has(after.grossWeight) && has(after.tareWeight)) {
    out.push({
      ...base,
      type: "WEIGHBRIDGE_COMPLETED",
      zone: "weighbridge",
      message: `${label} weighed · net ${after.netWeight}${after.tokenId ? ` · ${after.tokenId}` : ""}`,
      data: { gross: after.grossWeight, tare: after.tareWeight, net: after.netWeight },
    });
  }
  const qcBefore = QC_FIELDS.some((k) => has(before?.[k]));
  const qcAfter = QC_FIELDS.some((k) => has(after?.[k]));
  if (qcAfter && !qcBefore) {
    out.push({ ...base, type: "QC_SAMPLE_CREATED", zone: "qc", message: `QC sample for ${label}${after.tokenId ? ` · ${after.tokenId}` : ""}` });
  }
  const vBefore = qcVerdict(before);
  const vAfter = qcVerdict(after);
  if (vAfter && vAfter !== vBefore) {
    out.push({
      ...base,
      type: vAfter === "ACCEPTED" ? "QC_APPROVED" : "QC_REJECTED",
      zone: "qc",
      message: `${label} QC ${vAfter === "ACCEPTED" ? "approved" : "rejected"}${after.moisturePct ? ` · moisture ${after.moisturePct}%` : ""}`,
    });
  }
  if (changedToValue(before, after, "grnNo")) {
    out.push({ ...base, type: "GOODS_RECEIVED", zone: "store", refNo: String(after.grnNo), message: `${label} unloaded · ${after.grnNo}` });
  }
  return out;
}

export function outwardEvents(before, after) {
  if (!after) return [];
  const base = {
    entityType: "outward",
    entityId: idOf(after),
    vehicleNo: String(after.vehicleNo || after.tankerNo || ""),
    refNo: String(after.invoiceLrNo || after.challanNo || after.deliveryChallanNo || ""),
    date: String(after.date || ""),
  };
  const label = base.vehicleNo || "Vehicle";
  const product = after.product || after.material || after.section || "";
  const out = [];
  if (!before && (has(base.vehicleNo) || has(after.customer))) {
    out.push({ ...base, type: "DISPATCH_STARTED", zone: "dispatch", message: `${label} at loading · ${product}${after.customer ? ` · ${after.customer}` : ""}` });
  }
  if (changedToValue(before, after, "gateOutTime")) {
    out.push({ ...base, type: "DISPATCH_COMPLETED", zone: "dispatch", message: `${label} gate out ${after.gateOutTime} · ${product}` });
  }
  return out;
}

function rowKey(row) {
  return String(row?.id || row?.issueNo || row?.grnNo || "");
}

export function storeEvents(sheetType, date, beforeRows, afterRows) {
  if (sheetType !== "grn" && sheetType !== "issue") return [];
  const prev = new Set((beforeRows || []).map(rowKey));
  const out = [];
  for (const row of afterRows || []) {
    if (prev.has(rowKey(row))) continue;
    if (!has(row.itemName) && !has(row.itemCode) && !has(row.qty)) continue;
    if (sheetType === "grn") {
      out.push({
        type: "GOODS_RECEIVED",
        zone: "store",
        entityType: "store-grn",
        entityId: rowKey(row),
        refNo: String(row.grnNo || ""),
        vehicleNo: String(row.vehicleNo || ""),
        date,
        message: `GRN ${row.grnNo || ""} · ${row.itemName || row.itemCode || "item"} ${row.qty || ""} ${row.unit || ""}`.trim(),
      });
    } else {
      out.push({
        type: "MATERIAL_ISSUED",
        zone: "store",
        entityType: "store-issue",
        entityId: rowKey(row),
        refNo: String(row.issueNo || ""),
        date,
        message: `Issued ${row.itemName || row.itemCode || "item"} ${row.qty || ""} ${row.unit || ""}${row.issuedTo ? ` → ${row.issuedTo}` : ""}`.trim(),
      });
    }
  }
  return out;
}

/** Process readings: first reading for a batch = *_STARTED, later ones = *_UPDATED. */
export async function processReadingEvent({ Model, doc, isNew, kind }) {
  if (!doc || !isNew) return [];
  const batchId = String(doc.batchId || "");
  const view = String(doc.view || "");
  const fermenter = String(doc.passFermenter || doc.fermenterNo || "");
  const base = {
    entityType: kind,
    entityId: idOf(doc),
    batchId,
    fermenter,
    date: String(doc.date || ""),
  };
  if (kind === "liquefaction" && (view === "hplcWater" || view === "hplcSlurry")) {
    return [{ ...base, type: "HPLC_COMPLETED", zone: "lab", message: `Liquefaction HPLC (${view === "hplcWater" ? "water" : "slurry"})${batchId ? ` · ${batchId}` : ""}` }];
  }
  if (kind === "fermenter" && view === "hplc") {
    return [{ ...base, type: "HPLC_COMPLETED", zone: "lab", message: `Fermenter HPLC ${fermenter}${batchId ? ` · ${batchId}` : ""}${doc.ethanolPct ? ` · EtOH ${doc.ethanolPct}%` : ""}` }];
  }
  const prefix = kind === "milling" ? "MILLING" : kind === "liquefaction" ? "LIQUEFACTION" : "FERMENTATION";
  const zone = kind === "milling" ? "milling" : kind === "liquefaction" ? "liquefaction" : "fermentation";
  let first = false;
  if (batchId) {
    const filter = { batchId, _id: { $ne: doc._id } };
    if (view) filter.view = view;
    first = (await Model.countDocuments(filter)) === 0;
  }
  const detail =
    kind === "fermenter"
      ? [doc.temperatureC && `${doc.temperatureC}°C`, doc.ph && `pH ${doc.ph}`, doc.ethanolPct && `EtOH ${doc.ethanolPct}%`].filter(Boolean).join(" · ")
      : kind === "liquefaction"
        ? [doc.lt2Temp && `LT2 ${doc.lt2Temp}°C`, doc.lt2Ds && `DS ${doc.lt2Ds}`, doc.lt2Rs && `RS ${doc.lt2Rs}`].filter(Boolean).join(" · ")
        : [doc.starch && `starch ${doc.starch}%`, doc.finePowder && `fines ${doc.finePowder}%`].filter(Boolean).join(" · ");
  const where = kind === "fermenter" ? fermenter || "Fermenter" : kind === "milling" ? "Milling" : "Liquefaction";
  return [
    {
      ...base,
      type: `${prefix}_${first ? "STARTED" : "UPDATED"}`,
      zone,
      message: `${where} ${first ? "started" : "reading"}${batchId ? ` · ${batchId}` : ""}${detail ? ` · ${detail}` : ""}`,
    },
  ];
}

export function batchCreatedEvent(batch) {
  if (!batch) return [];
  return [
    {
      type: "BATCH_CREATED",
      zone: "fermentation",
      entityType: "batch",
      entityId: idOf(batch),
      batchId: String(batch.batchId || ""),
      fermenter: String(batch.fermenter || ""),
      date: String(batch.startDate || ""),
      message: `Batch ${batch.batchId} created on ${batch.fermenter} · ${batch.durationHours} h`,
    },
  ];
}

const LAB_SECTIONS = ["grain", "slurry", "wash", "distillation", "evaporation", "ddgs"];

function sectionFilled(section) {
  if (!section || typeof section !== "object") return false;
  return Object.values(section).some((v) => {
    if (v && typeof v === "object") return sectionFilled(v);
    return has(v);
  });
}

export function labRegisterEvents(before, after) {
  if (!after) return [];
  const out = [];
  for (const key of LAB_SECTIONS) {
    if (sectionFilled(after[key]) && !sectionFilled(before?.[key])) {
      out.push({
        type: "LAB_SAMPLE_CREATED",
        zone: "lab",
        entityType: "lab-register",
        entityId: idOf(after),
        date: String(after.date || ""),
        message: `Lab ${key} results entered · ${after.date}`,
      });
    }
  }
  return out;
}

export function distillationEvents(before, after) {
  if (!after) return [];
  const filled = (rows) => (rows || []).filter((r) => has(r?.actual)).length;
  const now = filled(after.rows);
  const prev = filled(before?.rows);
  if (now === 0 || now === prev) return [];
  return [
    {
      type: prev === 0 ? "DISTILLATION_STARTED" : "DISTILLATION_UPDATED",
      zone: "distillation",
      entityType: "distillation-operating",
      entityId: idOf(after),
      date: String(after.date || ""),
      message: `Distillation operating parameters ${prev === 0 ? "logged" : "updated"} · ${now} readings · ${after.date}`,
    },
  ];
}
