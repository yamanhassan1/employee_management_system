const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { CLIENT_URL } = require("./config/env");
const routes = require("./api/routes");
const globalRateLimiter = require("./api/middlewares/globalRateLimiter.middleware");
const errorHandler = require("./api/middlewares/errorHandler.midlleware");

const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalRateLimiter);

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/v1", routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
