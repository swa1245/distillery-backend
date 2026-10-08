import mongoose from "mongoose";

const processBatchSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true },
    startDate: { type: String, required: true },
    fermenter: { type: String, required: true },
    durationHours: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export const ProcessBatch = mongoose.model("ProcessBatch", processBatchSchema);
