import mongoose from "mongoose";

/** Liquefaction / HPLC analysis row — demo schema. */
const liquefactionSchema = new mongoose.Schema(
  {
    view: {
      type: String,
      enum: ["liquefaction", "hplcWater", "hplcSlurry"],
      default: "liquefaction",
    },
    date: { type: String, default: "" },
    shift: { type: String, default: "" },
    time: { type: String, default: "" },
    flourTph: { type: String, default: "" },
    thinSlopLph: { type: String, default: "" },
    processWaterLph: { type: String, default: "" },
    lessCondensateLph: { type: String, default: "" },
    leesLph: { type: String, default: "" },
    hotRate: { type: String, default: "" },
    slurryFlourRate: { type: String, default: "" },
    enzymeBrand: { type: String, default: "" },
    enzymeQty: { type: String, default: "" },
    stTemp: { type: String, default: "" },
    stLevel: { type: String, default: "" },
    stSg: { type: String, default: "" },
    stPh: { type: String, default: "" },
    lt1Temp: { type: String, default: "" },
    lt1Level: { type: String, default: "" },
    lt1Sg: { type: String, default: "" },
    lt1Ph: { type: String, default: "" },
    lt2Temp: { type: String, default: "" },
    lt2Level: { type: String, default: "" },
    lt2Sg: { type: String, default: "" },
    lt2Ph: { type: String, default: "" },
    lt2Ds: { type: String, default: "" },
    lt2Rs: { type: String, default: "" },
    lt2Iodine: { type: String, default: "" },
    passFermenter: { type: String, default: "" },
    batchId: { type: String, default: "" },
    dp4Pct: { type: String, default: "" },
    dp3Pct: { type: String, default: "" },
    dp2Pct: { type: String, default: "" },
    glucosePct: { type: String, default: "" },
    fructosePct: { type: String, default: "" },
    lacticAcidPct: { type: String, default: "" },
    glycerolPct: { type: String, default: "" },
    aceticAcidPct: { type: String, default: "" },
    ethanolPct: { type: String, default: "" },
  },
  { timestamps: true, strict: false }
);

liquefactionSchema.index({ date: 1, view: 1 });

export const Liquefaction = mongoose.model("Liquefaction", liquefactionSchema);
