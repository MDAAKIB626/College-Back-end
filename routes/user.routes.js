import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import { getUsers } from "../controllers/user.controller.js";

const router = express.Router();

// 🔐 ADMIN ONLY – users list by role
router.get("/", auth, role("admin"), getUsers);

export default router;
