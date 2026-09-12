import mongoose from "mongoose";

/** Prefermenter (cell culturing) + HPLC — demo schema. */
const prefermenterSchema = new mongoose.Schema(
  {
    view: {
      type: String,
      enum: ["culturing", "hplc"],
      default: "culturing",
    },
    date: { type: String, default: "" },
    stage: { type: String, default: "" },
    time: { type: String, default: "" },
    timeH: { type: String, default: "" },
    pfNumber: { type: String, default: "" },
    passFermenter: { type: String, default: "" },
    spGr: { type: String, default: "" },
    temp: { type: String, default: "" },
    ph: { type: String, default: "" },
    yeast: { type: String, default: "" },
    ga: { type: String, default: "" },
    urea: { type: String, default: "" },
    antiBiotic: { type: String, default: "" },
    booster: { type: String, default: "" },
    cellCount: { type: String, default: "" },
    levelPct: { type: String, default: "" },
    rsPct: { type: String, default: "" },
    alcPct: { type: String, default: "" },
    distillaseCs: { type: String, default: "" },
    promoterG: { type: String, default: "" },
    sctLactroll: { type: String, default: "" },
    angelYeast: { type: String, default: "" },
    ureaInput: { type: String, default: "" },
    nutroboost: { type: String, default: "" },
    smbs: { type: String, default: "" },
    mgso4: { type: String, default: "" },
    spenzyme: { type: String, default: "" },
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

prefermenterSchema.index({ date: 1, view: 1 });

export const Prefermenter = mongoose.model("Prefermenter", prefermenterSchema);
