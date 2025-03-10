// module.exports = { addSemesterData };
const Student = require("../models/student");
const Semester = require("../models/semesterModel");

// Add semester data (existing function)
const addSemesterData = async (req, res) => {
  try {
    // Extract USN from URL parameters and semester data from request body
    const { USN } = req.params;
    const { semester, subjects } = req.body;

    // Validate required fields
    if (
      !USN ||
      !semester ||
      !subjects ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        status: false,
        message: "USN, semester, and a non-empty subjects array are required",
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN });
    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // Check if semester data for the given semester already exists for this student
    const existingSemester = await Semester.findOne({
      student: student._id,
      semester,
    });
    if (existingSemester) {
      return res.status(400).json({
        status: false,
        message: `Semester data for ${semester} already exists`,
      });
    }

    // Create a new Semester document referencing this student
    const newSemester = new Semester({
      semester,
      subjects,
      student: student._id,
    });

    const savedSemester = await newSemester.save();

    return res.status(200).json({
      status: true,
      message: "Semester data added successfully",
      data: savedSemester,
    });
  } catch (err) {
    console.error("Error adding semester data:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error, please try again",
    });
  }
};

const getSemesterData = async (req, res) => {
  try {
    // Extract USN and semester from URL parameters
    const { USN, semester } = req.params;

    if (!USN) {
      return res.status(400).json({
        status: false,
        message: "USN is required",
      });
    }

    if (!semester) {
      return res.status(400).json({
        status: false,
        message: "Semester is required",
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN });
    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // Find the semester data associated with this student and specific semester
    const semesterData = await Semester.findOne({
      student: student._id,
      semester,
    });

    if (semesterData) {
      return res.status(200).json({
        status: true,
        message: `Semester ${semester} data fetched successfully`,
        data: semesterData,
      });
    } else {
      return res.status(404).json({
        status: false,
        message: "Semester data for  not found",
      });
    }
  } catch (err) {
    console.error("Error fetching semester data:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error, please try again",
    });
  }
};

// Edit semester data
// const editSemesterData = async (req, res) => {
//   try {
//     // Extract USN and semester from URL parameters and updated subjects from request body
//     const { USN, semester } = req.params;
//     const { subjects } = req.body;

//     // Validate required fields
//     if (
//       !USN ||
//       !semester ||
//       !subjects ||
//       !Array.isArray(subjects) ||
//       subjects.length === 0
//     ) {
//       return res.status(400).json({
//         status: false,
//         message: "USN, semester, and a non-empty subjects array are required",
//       });
//     }

//     // Find the student by USN
//     const student = await Student.findOne({ USN });
//     if (!student) {
//       return res.status(404).json({
//         status: false,
//         message: "Student not found",
//       });
//     }

//     // Update the semester record for this student using student ObjectId and semester value
//     const updatedSemester = await Semester.findOneAndUpdate(
//       { student: student._id, semester },
//       { $set: { subjects } },
//       { new: true }
//     );

//     if (updatedSemester) {
//       return res.status(200).json({
//         status: true,
//         message: "Semester data updated successfully",
//         data: updatedSemester,
//       });
//     } else {
//       return res.status(404).json({
//         status: false,
//         message: `Semester data for ${semester} not found`,
//       });
//     }
//   } catch (err) {
//     console.error("Error editing semester data:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error, please try again",
//     });
//   }
// };

const editSemesterData = async (req, res) => {
  try {
    // Extract USN and semester from URL parameters and updated subjects from request body
    const { USN, semester } = req.params;
    const { subjects } = req.body;

    // Validate required fields
    if (
      !USN ||
      !semester ||
      !subjects ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        status: false,
        message: "USN, semester, and a non-empty subjects array are required",
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN });
    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // Upsert: Update if semester exists, otherwise insert a new semester entry
    const updatedSemester = await Semester.findOneAndUpdate(
      { student: student._id, semester }, // Match student and semester
      { $set: { subjects } }, // Update subjects
      { new: true, upsert: true } // 'upsert: true' creates new document if not found
    );

    return res.status(200).json({
      status: true,
      message: "Semester data inserted and  updated successfully",
      data: updatedSemester,
    });
  } catch (err) {
    console.error("Error editing semester data:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error, please try again",
    });
  }
};

// Delete semester data
const deleteSemesterData = async (req, res) => {
  try {
    // Extract USN and semester from URL parameters
    const { USN, semester } = req.params;

    // Validate required fields
    if (!USN || !semester) {
      return res.status(400).json({
        status: false,
        message: "USN and semester are required",
      });
    }

    // Find the student by USN
    const student = await Student.findOne({ USN });
    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // Delete the semester record for this student
    const deletedSemester = await Semester.findOneAndDelete({
      student: student._id,
      semester,
    });

    if (deletedSemester) {
      return res.status(200).json({
        status: true,
        message: "Semester data deleted successfully",
      });
    } else {
      return res.status(404).json({
        status: false,
        message: `Semester data for ${semester} not found`,
      });
    }
  } catch (err) {
    console.error("Error deleting semester data:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error, please try again",
    });
  }
};

module.exports = {
  addSemesterData,
  editSemesterData,
  deleteSemesterData,
  getSemesterData,
};
