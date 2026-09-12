import mongoose from "mongoose";

/** Laboratory Sample Register — one analysis sheet per date. */
const labSampleRegisterSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    grain: { type: mongoose.Schema.Types.Mixed, default: {} },
    slurry: { type: mongoose.Schema.Types.Mixed, default: {} },
    wash: { type: mongoose.Schema.Types.Mixed, default: {} },
    distillation: { type: mongoose.Schema.Types.Mixed, default: {} },
    evaporation: { type: mongoose.Schema.Types.Mixed, default: {} },
    ddgs: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, strict: false }
);

export const LabSampleRegister = mongoose.model("LabSampleRegister", labSampleRegisterSchema);
