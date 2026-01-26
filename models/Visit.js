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

    students: [studentSchema],

    roWiseStudents: [
      {
        roEmail: String,
        students: [studentSchema],
        submittedAt: Date,
      },
    ],

    staffAssignments: [
      {
        staffEmail: String,
        students: [studentSchema],
        updatedAt: Date,
      },
    ],

    verifiedBy: String,
    verifiedAt: Date,
  },
});

export default mongoose.model("Visit", visitSchema);
