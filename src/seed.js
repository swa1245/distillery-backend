import "dotenv/config";
import { connectDb } from "./db.js";
import { User } from "./models/User.js";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/distiller";

/** DistilPro admin login only — no sample plant data. */
const DEFAULT_USER = {
  email: "admin@distilpro.com",
  password: "admin123",
  username: "admin",
  role: "admin",
  organizationName: "BioFuelPro Distillery",
};

async function main() {
  await connectDb(uri);

  // Remove old demo emails so only DistilPro admin remains
  await User.deleteMany({
    email: { $in: ["admin@biofuelpro.com", "admin@distilpro.com"] },
  });

  await User.create(DEFAULT_USER);

  console.log(`Seeded login only (no plant data)`);
  console.log(`  email:    ${DEFAULT_USER.email}`);
  console.log(`  password: ${DEFAULT_USER.password}`);
  console.log(`  org:      ${DEFAULT_USER.organizationName}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
