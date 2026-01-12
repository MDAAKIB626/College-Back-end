import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import {
  getVisits,
  submitSchoolData,
  addStudentRemark,
  getVisitById,
  createVisit ,  
   updateVisit 
} from "../controllers/visit.controller.js";

const router = express.Router();

router.get("/", auth, getVisits);

// 🔥 ADMIN CREATE VISIT
router.post("/", auth, role("admin"), createVisit);
// 🔥 UPDATE VISIT (ADMIN)
router.put("/:id", auth, role("admin"), updateVisit);


router.get("/:id", auth, getVisitById);
router.post("/:id/school-data", auth, role("ro"), submitSchoolData);
router.post("/:id/student/:sid/remark", auth, role("ro"), addStudentRemark);

export default router;
