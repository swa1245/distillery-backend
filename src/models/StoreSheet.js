import mongoose from "mongoose";

/** Store dated sheet — one document per sheetType + date (GRN, stock, issue, …). */
const storeSheetSchema = new mongoose.Schema(
  {
    sheetType: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    rows: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

storeSheetSchema.index({ sheetType: 1, date: 1 }, { unique: true });

export const StoreSheet = mongoose.model("StoreSheet", storeSheetSchema);
