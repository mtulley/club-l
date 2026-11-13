import "dotenv/config";
import express from "express";
import cors from "cors";
import * as db from "./db.js";

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all products or all active products
app.get("/api/products", async (req, res) => {
  const { active } = req.query;

  let db_query = "";
  if (active) {
    db_query = `
      SELECT * FROM products
      WHERE active = TRUE
      ORDER BY id;
    `;
  } else {
    db_query = `
      SELECT * FROM products
      ORDER BY id;
    `;
  }

  const db_response = await db.query(db_query);
  res.json(db_response.rows);
});

// Get individual product
app.get("/api/products/:id", async (req, res) => {
  const id = req.params.id;

  const db_query_params = [id];
  const db_query = `
    SELECT * FROM products
    WHERE id = $1;
  `;

  const db_response = await db.query(db_query, db_query_params);
  res.json(db_response.rows);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
