import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import userRoutes from "./routes/user.routes.js"; // 👈 ADD

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/users", userRoutes); // 👈 ADD

export default app;
