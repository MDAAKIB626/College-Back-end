import mongoose from "mongoose";

const remarkSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now },
});

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

const visitSchema = new mongoose.Schema({
  school: String,
  className: String,
  visitDate: String,

  // 🔥 ADD THESE
  speaker: {
    type: String,
    default: "",
  },
  peon: {
    type: String,
    default: "",
  },

  teachers: [{ email: String }],
  relationOfficers: [{ email: String, accepted: Boolean }],

  status: { type: String, default: "Pending" },

  schoolData: {
    principal: {
      name: String,
      contact: String,
    },
    students: [studentSchema],
    totalStudents: Number,
    boys: Number,
    girls: Number,
    mhtCetAppeared: Number,
    admissionTaken: Number,
  },
});

export default mongoose.model("Visit", visitSchema);
