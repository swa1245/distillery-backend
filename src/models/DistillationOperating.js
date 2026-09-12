import mongoose from "mongoose";

/** Distillation Operating Parameters — one sheet (row list) per date. */
const paramRowSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    section: { type: String, default: "A" },
    slNo: { type: String, default: "" },
    particulars: { type: String, default: "" },
    unit: { type: String, default: "" },
    target: { type: String, default: "" },
    actual: { type: String, default: "" },
  },
  { _id: false }
);

const distillationOperatingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    rows: { type: [paramRowSchema], default: [] },
  },
  { timestamps: true }
);

export const DistillationOperating = mongoose.model(
  "DistillationOperating",
  distillationOperatingSchema
);
