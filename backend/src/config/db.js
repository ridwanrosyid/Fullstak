import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log(`✅ Connected to MONGODB: ${conn.connection.host}`);
  } catch (error) {
    console.error("💥 MONGODB connection error");
    console.error(error);
    console.error("Error message:", error.message);
    process.exit(1); // exit code 1 means failure, 0 means success
  }
};
