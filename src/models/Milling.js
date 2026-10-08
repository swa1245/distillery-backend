import mongoose from "mongoose";

/** Milling flour analysis row — demo schema (flexible fields). */
const millingSchema = new mongoose.Schema(
  {
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    shift: { type: String, default: "" },
    maize: { type: String, default: "" },
    jowar: { type: String, default: "" },
    brownRice: { type: String, default: "" },
    um12: { type: String, default: "" },
    um1: { type: String, default: "" },
    um085: { type: String, default: "" },
    um06: { type: String, default: "" },
    um03: { type: String, default: "" },
    mesh1180_0850: { type: String, default: "" },
    mesh0600_0300: { type: String, default: "" },
    finePowder: { type: String, default: "" },
    starch: { type: String, default: "" },
    passFermenter: { type: String, default: "" },
    batchId: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true, strict: false }
);

millingSchema.index({ date: 1 });

export const Milling = mongoose.model("Milling", millingSchema);
