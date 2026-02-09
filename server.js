import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
// import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // await connectDB(); // ❌ abhi OFF
  app.listen(PORT, () => {
    console.log("🚀 Server running without DB on port " + PORT);
  });
};

startServer();
