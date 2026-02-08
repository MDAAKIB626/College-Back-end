import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// ✅ PRODUCTION SAFE CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://college-website-front-end-9m7k.vercel.app",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/users", userRoutes);

export default app;
