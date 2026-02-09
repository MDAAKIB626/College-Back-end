import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("🚀 Server running on port " + PORT);
    });
  } catch (error) {
    console.error("❌ Server start error:", error.message);
  }
};

startServer();
