import mongoose from "mongoose";

/** Demo login user — not production-hardened. */
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    username: { type: String, default: "" },
    role: { type: String, default: "admin" },
    organizationName: { type: String, default: "BioFuelPro Distillery" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
