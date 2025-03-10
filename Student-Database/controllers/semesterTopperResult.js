// const Student = require("../models/student");
// const Semester = require("../models/");

// const getSemesterResultsBySemester = async (req, res) => {
//   try {
//     // Extract USN (if needed) and semester from request body; here we assume only semester is needed
//     // because we're looking for toppers for that semester across all students.
//     const { semester } = req.body;
//     if (!semester) {
//       return res.status(400).json({
//         status: false,
//         message: "Semester is required",
//       });
//     }

//     // Build the aggregation pipeline to get the overall percentage per semester record
//     const pipeline = [
//       { $match: { semester: semester } },
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
//           _id: "$student", // Group by student ObjectId
//           semester: { $first: "$semester" },
//           totalMarksObtained: { $sum: "$subjects.marksObtained" },
//           totalMaxMarks: { $sum: "$subjects.maxMarks" },
//         },
//       },
//       {
//         $addFields: {
//           overallPercentage: {
//             $multiply: [
//               { $divide: ["$totalMarksObtained", "$totalMaxMarks"] },
//               100,
//             ],
//           },
//         },
//       },
//       // Join with student details to get name and USN
//       {
//         $lookup: {
//           from: "students",
//           localField: "_id",
//           foreignField: "_id",
//           as: "studentDetails",
//         },
//       },
//       { $unwind: "$studentDetails" },
//       {
//         $project: {
//           _id: 0,
//           semester: 1,
//           overallPercentage: 1,
//           name: "$studentDetails.name",
//           USN: "$studentDetails.USN",
//         },
//       },
//       { $sort: { overallPercentage: -1 } },
//     ];

//     const results = await Semester.aggregate(pipeline);

//     if (results.length) {
//       return res.status(200).json({
//         status: true,
//         message: "Semester results (toppers) fetched successfully",
//         data: results,
//       });
//     } else {
//       return res.status(404).json({
//         status: false,
//         message: "No semester results found",
//       });
//     }
//   } catch (err) {
//     console.error("Error fetching semester results:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error, please try again",
//     });
//   }
// };

// module.exports = { getSemesterResultsBySemester };

// const Student = require("../models/student");
// const Semester = require("../models/semesterModel");

// const getSemesterResultsBySemester = async (req, res) => {
//   try {
//     const { semester } = req.body;

//     if (!semester || (Array.isArray(semester) && semester.length === 0)) {
//       return res.status(400).json({
//         status: false,
//         message: "At least one semester is required",
//       });
//     }

//     // Ensure semester is an array for uniform handling
//     const semesterArray = Array.isArray(semester) ? semester : [semester];

//     // Build the aggregation pipeline
//     const pipeline = [
//       { $match: { semester: { $in: semesterArray } } }, // Match multiple semesters
//       { $unwind: "$subjects" },
//       {
//         $group: {
//           _id: "$student", // Group by student across semesters
//           totalMarksObtained: { $sum: "$subjects.marksObtained" },
//           totalMaxMarks: { $sum: "$subjects.maxMarks" },
//         },
//       },
//       {
//         $addFields: {
//           overallPercentage: {
//             $multiply: [
//               { $divide: ["$totalMarksObtained", "$totalMaxMarks"] },
//               100,
//             ],
//           },
//         },
//       },
//       // Join with student details
//       {
//         $lookup: {
//           from: "students",
//           localField: "_id",
//           foreignField: "_id",
//           as: "studentDetails",
//         },
//       },
//       { $unwind: "$studentDetails" },
//       {
//         $project: {
//           _id: 0,
//           overallPercentage: 1,
//           name: "$studentDetails.name",
//           USN: "$studentDetails.USN",
//         },
//       },
//       { $sort: { overallPercentage: -1 } }, // Sort in descending order (highest first)
//     ];

//     const results = await Semester.aggregate(pipeline);

//     if (results.length) {
//       return res.status(200).json({
//         status: true,
//         message: "Semester results fetched successfully",
//         data: results, // Returning full sorted list
//       });
//     } else {
//       return res.status(404).json({
//         status: false,
//         message: "No results found",
//       });
//     }
//   } catch (err) {
//     console.error("Error fetching semester results:", err);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error, please try again",
//     });
//   }
// };

// module.exports = { getSemesterResultsBySemester };

const Semester = require("../models/semesterModel");
const {
  validateSemesterInput,
  buildAggregationPipeline,
  formatResponse,
} = require("../utils/Tooper-utils");

const getSemesterResultsBySemester = async (req, res) => {
  try {
    const { semester } = req.body;

    // Validate semester input
    const validationError = validateSemesterInput(semester);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Build aggregation pipeline
    const pipeline = buildAggregationPipeline(semester);

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

module.exports = { getSemesterResultsBySemester };
