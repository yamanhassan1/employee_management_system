const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

const connectDB = async () => {
  const mongoUri = MONGO_URI || "mongodb://127.0.0.1:27017/employee_management_system";

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn("Continuing without a database connection. Authentication and data routes will fail until MongoDB is available.");
  }
};

module.exports = connectDB;