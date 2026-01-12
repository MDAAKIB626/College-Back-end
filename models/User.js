import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "ro", "teacher"],
  },
});

export default mongoose.model("User", userSchema);
