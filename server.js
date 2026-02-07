import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  await connectDB(); // ⭐ pehle DB
  app.listen(process.env.PORT, () => {
    console.log("🚀 Server running on port " + process.env.PORT);
  });
};

startServer();
