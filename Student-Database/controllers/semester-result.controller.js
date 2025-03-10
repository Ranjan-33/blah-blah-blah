// // controllers/semester-result.controller.js
// const Student = require("../models/student");
// const Semester = require("../models/semesterModel");

// const getSemesterResults = async (req, res) => {
//   try {
//     // Extract USN (mandatory) and semester (optional) from request body
//     const { USN, semester } = req.body;

//     // Validate USN
//     if (!USN) {
//       return res.status(400).json({
//         status: false,
//         message: "USN is required",
//       });
//     }

//     // Find student using USN
//     const student = await Student.findOne({ USN });
//     if (!student) {
//       return res.status(404).json({
//         status: false,
//         message: "Student not found",
//       });
//     }

//     // Create match stage for aggregation
//     let matchStage = { student: student._id };

//     // If semester is provided, handle single or multiple semesters
//     if (semester) {
//       if (Array.isArray(semester)) {
//         matchStage.semester = { $in: semester }; // If multiple semesters
//       } else {
//         matchStage.semester = semester; // If single semester
//       }
//     }

//     const pipeline = [
//       { $match: matchStage },
//       { $unwind: "$subjects" },
//       {
//         $addFields: {
//           "subjects.subjectPercentage": {
//             $multiply: [
//               { $divide: ["$subjects.marksObtained", "$subjects.maxMarks"] },
//               100,
//             ],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$semester",
//           subjects: { $push: "$subjects" },
//           totalMarksObtained: { $sum: "$subjects.marksObtained" },
//           totalMaxMarks: { $sum: "$subjects.maxMarks" },
//         },
//       },
//       {
//         $addFields: {
//           semesterPercentage: {
//             $multiply: [
//               { $divide: ["$totalMarksObtained", "$totalMaxMarks"] },
//               100,
//             ],
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           semester: "$_id",
//           subjects: 1,
//           semesterPercentage: 1,
//         },
//       },
//     ];

//     // Execute aggregation query
//     let results = await Semester.aggregate(pipeline);

//     if (!results.length) {
//       return res.status(404).json({
//         status: false,
//         message: "No semester results found",
//       });
//     }

//     // Calculate overallPercentage for the selected semesters
//     let totalPercentage = results.reduce(
//       (acc, sem) => acc + sem.semesterPercentage,
//       0
//     );
//     let overallPercentage = totalPercentage / results.length;

//     return res.status(200).json({
//       status: true,
//       message: "Semester results fetched successfully",
//       data: results,
//       overallPercentage: overallPercentage.toFixed(2), // Rounding to 2 decimal places
//     });
//   } catch (err) {
//     console.error("Error fetching semester results:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error, please try again",
//     });
//   }
// };

// module.exports = { getSemesterResults };

const {
  validateUSN,
  buildMatchStage,
  buildAggregationPipeline,
  formatResponse,
} = require("../utils/semester-result-utils");
const Student = require("../models/student");
const Semester = require("../models/semesterModel");

const getSemesterResults = async (req, res) => {
  try {
    const { USN, semester } = req.body;

    // Validate USN
    const validationError = validateUSN(USN);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Find student by USN
    const student = await Student.findOne({ USN });
    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // Build match stage based on student and semester
    const matchStage = buildMatchStage(student._id, semester);

    // Build aggregation pipeline
    const pipeline = buildAggregationPipeline(matchStage);

    // Execute aggregation
    const results = await Semester.aggregate(pipeline);

    // Format and send response
    return formatResponse(res, results);
  } catch (err) {
    console.error("Error fetching semester results:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error, please try again",
    });
  }
};

module.exports = { getSemesterResults };
