import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

/* ================= SECURE CORS ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://college-front-end-xi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/users", userRoutes);

export default app;
