import mongoose from "mongoose";

/** Fermenter analysis + HPLC — demo schema. */
const fermenterSchema = new mongoose.Schema(
  {
    view: {
      type: String,
      enum: ["fermentation", "hplc"],
      default: "fermentation",
    },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    batchId: { type: String, default: "" },
    fermenterNo: { type: String, default: "" },
    status: { type: String, default: "" },
    volPct: { type: String, default: "" },
    levelPct: { type: String, default: "" },
    volume: { type: String, default: "" },
    va: { type: String, default: "" },
    gravity: { type: String, default: "" },
    rsPct: { type: String, default: "" },
    dstPct: { type: String, default: "" },
    ph: { type: String, default: "" },
    temperatureC: { type: String, default: "" },
    distillaseCs: { type: String, default: "" },
    urea: { type: String, default: "" },
    yeast: { type: String, default: "" },
    spenzyme: { type: String, default: "" },
    nutroboost: { type: String, default: "" },
    aquzymeLiq: { type: String, default: "" },
    smbs: { type: String, default: "" },
    mgso4: { type: String, default: "" },
    promoterG: { type: String, default: "" },
    sctLactroll: { type: String, default: "" },
    caustic: { type: String, default: "" },
    acid: { type: String, default: "" },
    dp4PlusPct: { type: String, default: "" },
    dp4Pct: { type: String, default: "" },
    dp3Pct: { type: String, default: "" },
    dp2Pct: { type: String, default: "" },
    dp1Pct: { type: String, default: "" },
    lacticAcidPct: { type: String, default: "" },
    glycerolPct: { type: String, default: "" },
    aceticAcidPct: { type: String, default: "" },
    ethanolPct: { type: String, default: "" },
  },
  { timestamps: true, strict: false }
);

fermenterSchema.index({ date: 1, view: 1 });
fermenterSchema.index({ batchId: 1, view: 1 });

export const Fermenter = mongoose.model("Fermenter", fermenterSchema);
