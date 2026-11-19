import { readFile } from "node:fs/promises";
import { query, close } from "./db.js";

async function runMigration() {
  try {
    const migration = await readFile(
      new URL("../migrations/001_store_orders.sql", import.meta.url),
      "utf8",
    );
    await query(migration);
    console.log("Store order migration applied.");
  } catch (error) {
    console.error("Store order migration failed:", error.message);
    process.exitCode = 1;
  }

  try {
    await close();
  } catch (error) {
    console.error("Could not close the database connection:", error.message);
    process.exitCode = 1;
  }
}

runMigration();
