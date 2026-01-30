import mongoose from "mongoose";

/* ================= REMARK ================= */
const remarkSchema = new mongoose.Schema({
  date: String,
  received: String,
  updatedBy: String,
  updatedAt: Date,
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
    assigned: { type: Boolean, default: false }, // 🔥 IMPORTANT
});

/* ================= VISIT ================= */
const visitSchema = new mongoose.Schema({
  school: String,
  className: String,
  visitDate: String,

  locationType: {
    type: String,
    enum: ["Malegaon", "Outside"],
    required: true,
  },

  outsideLocation: String,
  speakers: [String],

  teachers: [{ email: String }],

  relationOfficers: [
    {
      email: String,
      accepted: { type: Boolean, default: true },
      assignedStudents: Number,
    },
  ],

  status: {
    type: String,
    enum: [
      "CREATED",
      "RO_UPLOADED",
      "ADMIN_ASSIGNED",
      "STAFF_UPDATED",
      "ADMIN_VERIFIED",
    ],
    default: "CREATED",
  },

  schoolData: {
    principal: {
      name: String,
      contact: String,
    },

    students: [studentSchema], // ⚠️ ab USE nahi hoga

    roWiseStudents: [
      {
        roEmail: String,
        students: [studentSchema], // ✅ MASTER DATA
        submittedAt: Date,
      },
    ],

    staffAssignments: [
      {
        staffEmail: String,
        students: [studentSchema], // ⚠️ working copy
        updatedAt: Date,
        submitted: { type: Boolean, default: false },
          // 🔥 NEW (IMPORTANT)
    updatedCount: { type: Number, default: 0 },
    submittedAt: Date,
      },
    ],

    verifiedBy: String,
    verifiedAt: Date,
  },
});

export default mongoose.model("Visit", visitSchema);
