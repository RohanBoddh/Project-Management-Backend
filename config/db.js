const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  // Already connected
  if (
    isConnected ||
    mongoose.connection.readyState === 1
  ) {
    return;
  }

  // Connection currently in progress
  if (
    mongoose.connection.readyState === 2
  ) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined"
      );
    }

    const conn =
      await mongoose.connect(
        process.env.MONGO_URI,
        {
          serverSelectionTimeoutMS: 10000,
          maxPoolSize: 10,
        }
      );

    isConnected = true;

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    isConnected = false;

    console.error(
      "Database connection failed:",
      error.message
    );

    throw error;
  }
};

module.exports = connectDB;