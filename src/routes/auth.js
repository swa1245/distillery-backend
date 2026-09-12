import { Router } from "express";
import crypto from "crypto";
import { User } from "../models/User.js";

const router = Router();

function publicUser(doc) {
  return {
    id: String(doc._id),
    email: doc.email,
    username: doc.username || doc.email.split("@")[0],
    role: doc.role || "admin",
    organizationName: doc.organizationName || "BioFuelPro Distillery",
  };
}

/** POST /api/auth/login  { email, password } */
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const doc = await User.findOne({
      $or: [{ email }, { username: email }],
    });
    if (!doc || doc.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    res.json({
      success: true,
      token,
      user: publicUser(doc),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/** GET /api/auth/default — demo hint (safe to expose in demo) */
router.get("/default", async (_req, res) => {
  try {
    const doc = await User.findOne().sort({ createdAt: 1 }).lean();
    if (!doc) {
      return res.json({
        success: true,
        email: "admin@distilpro.com",
        password: "admin123",
      });
    }
    res.json({
      success: true,
      email: doc.email,
      password: doc.password,
      username: doc.username,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
