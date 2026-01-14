import mongoose from "mongoose";

/* ================= REMARK ================= */
const remarkSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now },
});

/* ================= STUDENT ================= */
const studentSchema = new mongoose.Schema({
  studentName: String,
  studentMobile: String,
  parentMobile: String,
  className: String,
  gender: String,
  interestedBranch: String,
  mhtCet: String,
  admissionProcess: String,
  remarks: [remarkSchema],
});

/* ================= VISIT ================= */
const visitSchema = new mongoose.Schema({
  school: { type: String, required: true },
  className: { type: String, required: true },
  visitDate: { type: String, required: true },
  schoolLocation: {
    type: String,
    enum: ["Malegaon", "Outside"],
    default: "Malegaon",
    required: true,
  },
  speaker: { type: [String], default: [], required: true },
  peon: { type: String, default: "" },
  teachers: [{ email: String }],
  relationOfficers: [{ email: String, accepted: Boolean }],
  status: { type: String, default: "Pending" },
  schoolData: {
    principal: { name: String, contact: String },
    students: [studentSchema],
    totalStudents: Number,
    boys: Number,
    girls: Number,
    mhtCetAppeared: Number,
    admissionTaken: Number,
  },
});

export default mongoose.model("Visit", visitSchema);
