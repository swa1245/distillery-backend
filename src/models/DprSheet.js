import mongoose from "mongoose";

/** DPR section sheet — one document per sectionId with parameter keyed values. */
const dprSheetSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true, unique: true, index: true },
    byKey: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const DprSheet = mongoose.model("DprSheet", dprSheetSchema);
