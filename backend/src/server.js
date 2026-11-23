import "dotenv/config";
import express from "express";
import cors from "cors";

import * as db from "./db.js";

const app = express();
const BACKEND_PORT = process.env.BACKEND_PORT || 3000;

app.use(cors());

app.get("/api/products", async (req, res) => {
  const text = "SELECT * FROM Products";
  const params = [];

  const response = await db.query(text, params);
  res.json(response.rows);
});

app.listen(BACKEND_PORT, () => {
  console.log(`Server listening on port ${BACKEND_PORT}.`);
});
