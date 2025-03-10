const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    USN: {
      type: String,
      required: [true, "USN is required"],
      unique: true,
      trim: true,
      maxlength: [10, "USN cannot be more than 10 characters"],
      immutable: true,
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
      maxlength: [50, "Branch cannot be more than 50 characters"],
      uppercase: true,
    },
    gender: {
      type: String,
      required: [true],
      enum: ["Male", "Female", "Other"],
    },
    dob: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
