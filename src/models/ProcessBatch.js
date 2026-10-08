import mongoose from "mongoose";

const processBatchSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true },
    startDate: { type: String, required: true },
    fermenter: { type: String, required: true },
    durationHours: { type: Number, default: 30 },
    notes: [
      {
        area: { type: String, enum: ["prefermenter", "fermenter"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const ProcessBatch = mongoose.model("ProcessBatch", processBatchSchema);
