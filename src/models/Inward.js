import mongoose from "mongoose";

/** Grain inward receipt (gate → weighbridge → QC). Demo schema. */
const inwardSchema = new mongoose.Schema(
  {
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    vehicleNo: { type: String, default: "" },
    supplier: { type: String, default: "" },
    grainType: { type: String, default: "" },
    siloId: { type: String, default: "" },
    grossWeight: { type: String, default: "" },
    tareWeight: { type: String, default: "" },
    netWeight: { type: String, default: "" },
    moisturePct: { type: String, default: "" },
    starchPct: { type: String, default: "" },
    fmPct: { type: String, default: "" },
    foreignMatterPct: { type: String, default: "" },
    brokenSeedPct: { type: String, default: "" },
    qcStatus: { type: String, default: "" },
    batchNo: { type: String, default: "" },
    grnNo: { type: String, default: "" },
    chemistRemark: { type: String, default: "" },
    tokenId: { type: String, default: "" },
  },
  { timestamps: true }
);

inwardSchema.index({ date: 1 });
inwardSchema.index({ vehicleNo: 1 });
inwardSchema.index({ tokenId: 1 });

export const Inward = mongoose.model("Inward", inwardSchema);
