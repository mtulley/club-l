const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/store-items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM store_items");

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/store-items/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const result = await pool.query("SELECT * FROM store_items WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return response.status(404).json({
        error: "Store item not found",
      });
    }

    response.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
