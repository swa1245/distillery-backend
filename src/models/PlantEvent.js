import mongoose from "mongoose";

/** Plant activity log — one row per real state change detected on a saved record. */
const plantEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    zone: { type: String, default: "" },
    entityType: { type: String, default: "" },
    entityId: { type: String, default: "" },
    refNo: { type: String, default: "" },
    vehicleNo: { type: String, default: "" },
    batchId: { type: String, default: "" },
    fermenter: { type: String, default: "" },
    date: { type: String, default: "" },
    message: { type: String, default: "" },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

plantEventSchema.index({ at: -1 });

export const PlantEvent = mongoose.model("PlantEvent", plantEventSchema);
