const mongoose = require("mongoose");
const { NODE_ENV } = require("../../config/env");
const logger = require("../../utils/logger");

const errorHandler = (err, req, res, next) => {
  // Defaults
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Mongoose duplicate key (e.g. unique email / department name)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    message = `Duplicate value for ${field}: ${value}`;
    errors = [{ field, message: `'${field}' must be unique` }];
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (NODE_ENV === "development") logger.error(err.message, { stack: err.stack });

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
