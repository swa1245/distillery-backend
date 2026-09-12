import "dotenv/config";
import { connectDb } from "./db.js";
import { User } from "./models/User.js";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/distiller";

/** DistilPro logins only — no sample plant data. */
const USERS = [
  {
    email: "admin@distilpro.com",
    password: "admin123",
    username: "admin",
    role: "admin",
    organizationName: "BioFuelPro Distillery",
  },
  {
    email: "user@distilpro.com",
    password: "user123",
    username: "user",
    role: "user",
    organizationName: "BioFuelPro Distillery",
  },
];

async function main() {
  await connectDb(uri);

  // Drop old BioFuelPro demo login if present
  await User.deleteMany({ email: "admin@biofuelpro.com" });

  for (const u of USERS) {
    await User.findOneAndUpdate(
      { email: u.email },
      { $set: u },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${u.email} / ${u.password}  (${u.role})`);
  }

  console.log("\nSeeded DistilPro login users only (no plant data).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
