import mongoose from "mongoose";

/** Outward dispatch — ethanol / ddgs / co2 / other. Demo schema. */
const outwardSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: ["ethanol", "ddgs", "co2", "other"],
      default: "ethanol",
    },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    vehicleNo: { type: String, default: "" },
    tankerNo: { type: String, default: "" },
    customer: { type: String, default: "" },
    product: { type: String, default: "" },
    material: { type: String, default: "" },
    category: { type: String, default: "" },
    grade: { type: String, default: "" },
    batchNo: { type: String, default: "" },
    batchLotNo: { type: String, default: "" },
    tankNo: { type: String, default: "" },
    sourceSilo: { type: String, default: "" },
    source: { type: String, default: "" },
    loadingPoint: { type: String, default: "" },
    qtyKl: { type: String, default: "" },
    qtyMt: { type: String, default: "" },
    qtyLoadedMt: { type: String, default: "" },
    qty: { type: String, default: "" },
    unit: { type: String, default: "" },
    strengthPct: { type: String, default: "" },
    aaQtyKl: { type: String, default: "" },
    moisturePct: { type: String, default: "" },
    proteinPct: { type: String, default: "" },
    co2PurityPct: { type: String, default: "" },
    pressure: { type: String, default: "" },
    temperature: { type: String, default: "" },
    qcStatus: { type: String, default: "" },
    invoiceLrNo: { type: String, default: "" },
    weighmentSlipNo: { type: String, default: "" },
    deliveryChallanNo: { type: String, default: "" },
    challanNo: { type: String, default: "" },
    destination: { type: String, default: "" },
    gateOutTime: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

outwardSchema.index({ date: 1, section: 1 });
outwardSchema.index({ vehicleNo: 1 });

export const Outward = mongoose.model("Outward", outwardSchema);
