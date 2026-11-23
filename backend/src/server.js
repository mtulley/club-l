import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const BACKEND_PORT = process.env.BACKEND_PORT || 3000;

app.use(cors());

app.get("/api/products", (req, res) => {
  const text = "SELECT * FROM Products";
  const params = [];

  try {
    const response = db.query(text, params);

    if ()
  }
});

app.listen(BACKEND_PORT, () => {
  console.log(`Server listening on port ${BACKEND_PORT}.`);
});
