require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Lost Found Backend Server is running",
  });
});

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;