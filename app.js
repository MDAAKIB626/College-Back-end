import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",              // 👈 tumhara local frontend
      "https://college-front-end-xi.vercel.app", // 👈 live frontend
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/users", userRoutes);

export default app;
