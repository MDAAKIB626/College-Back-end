import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import {
  getVisits,
  getVisitById,
  createVisit,
  roUpload,
  adminAssign,
  staffUpdate,
  adminVerify,
  updateStudentRemark,
  updateAdmission,
} from "../controllers/visit.controller.js";

const router = express.Router();

router.get("/", auth, getVisits);
router.get("/:id", auth, getVisitById);

router.post("/", auth, role("admin"), createVisit);
router.post("/:id/ro-upload", auth, role("ro"), roUpload);
router.post("/:id/admin-assign", auth, role("admin"), adminAssign);
router.post("/:id/staff-update", auth, role("teacher"), staffUpdate);
router.post("/:id/update-remark", auth, role("teacher"), updateStudentRemark);
router.post("/:id/update-admission", auth, role("teacher"), updateAdmission);
router.post("/:id/admin-verify", auth, role("admin"), adminVerify);

export default router;
