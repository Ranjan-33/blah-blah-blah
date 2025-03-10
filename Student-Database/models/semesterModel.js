const mongoose = require("mongoose");

// Define a schema for each subject in a semester
const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true,
  },
  maxMarks: {
    type: Number,
    required: [true, "Maximum marks are required"],
  },
  marksObtained: {
    type: Number,
    required: [true, "Marks obtained are required"],
  },
});

// Schema for semester details
const semesterSchema = new mongoose.Schema(
  {
    semester: {
      type: String,
      required: [true, "Semester is required"],
      enum: ["sem1", "sem2", "sem3", "sem4", "sem5", "sem6", "sem7", "sem8"],
    },
    subjects: [subjectSchema],
    // Reference to the Student document (using ObjectId)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Semester", semesterSchema);
