const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello, Express Server for Club L!");
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
