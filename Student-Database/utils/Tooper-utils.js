// const validateSemesterInput = (semester) => {
//   if (!semester || (Array.isArray(semester) && semester.length === 0)) {
//     return {
//       status: false,
//       message: "At least one semester is required",
//     };
//   }
//   return null;
// };

// const buildAggregationPipeline = (semester) => {
//   const semesterArray = Array.isArray(semester) ? semester : [semester];

//   return [
//     { $match: { semester: { $in: semesterArray } } },
//     { $unwind: "$subjects" },
//     {
//       $group: {
//         _id: "$student",
//         totalMarksObtained: { $sum: "$subjects.marksObtained" },
//         totalMaxMarks: { $sum: "$subjects.maxMarks" },
//       },
//     },
//     {
//       $addFields: {
//         overallPercentage: {
//           $multiply: [
//             { $divide: ["$totalMarksObtained", "$totalMaxMarks"] },
//             100,
//           ],
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "students",
//         localField: "_id",
//         foreignField: "_id",
//         as: "studentDetails",
//       },
//     },
//     { $unwind: "$studentDetails" },
//     {
//       $project: {
//         _id: 0,
//         overallPercentage: 1,
//         name: "$studentDetails.name",
//         USN: "$studentDetails.USN",
//       },
//     },
//     { $sort: { overallPercentage: -1 } },
//   ];
// };

// const formatResponse = (res, results) => {
//   if (results.length) {
//     return res.status(200).json({
//       status: true,
//       message: "Semester results fetched successfully",
//       data: results,
//     });
//   } else {
//     return res.status(404).json({
//       status: false,
//       message: "No results found",
//     });
//   }
// };

// module.exports = {
//   validateSemesterInput,
//   buildAggregationPipeline,
//   formatResponse,
// };

const validateSemesterInput = (semester) => {
  if (!semester || (Array.isArray(semester) && semester.length === 0)) {
    return {
      status: false,
      message: "At least one semester is required",
    };
  }
  return null;
};

const buildAggregationPipeline = (semester) => {
  const semesterArray = Array.isArray(semester) ? semester : [semester];

  return [
    // Match documents for any of the specified semesters
    { $match: { semester: { $in: semesterArray } } },

    // Group by student first to get their data across all semesters
    {
      $group: {
        _id: "$student",
        semesterData: {
          $push: {
            semester: "$semester",
            subjects: "$subjects",
          },
        },
        // Count unique semesters for this student
        uniqueSemesters: { $addToSet: "$semester" },
      },
    },

    // Filter students who have all required semesters
    {
      $match: {
        $expr: {
          $eq: [{ $size: "$uniqueSemesters" }, semesterArray.length],
        },
      },
    },

    // Unwind the semester data to process each semester's subjects
    { $unwind: "$semesterData" },
    { $unwind: "$semesterData.subjects" },

    // Group again by student to calculate total marks across all semesters
    {
      $group: {
        _id: "$_id",
        totalMarksObtained: {
          $sum: "$semesterData.subjects.marksObtained",
        },
        totalMaxMarks: {
          $sum: "$semesterData.subjects.maxMarks",
        },
        uniqueSemesters: { $first: "$uniqueSemesters" },
      },
    },

    // Calculate the overall percentage across all semesters
    {
      $addFields: {
        overallPercentage: {
          $multiply: [
            { $divide: ["$totalMarksObtained", "$totalMaxMarks"] },
            100,
          ],
        },
      },
    },

    // Get student details
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "_id",
        as: "studentDetails",
      },
    },
    { $unwind: "$studentDetails" },

    // Project final results
    {
      $project: {
        _id: 0,
        name: "$studentDetails.name",
        USN: "$studentDetails.USN",
        overallPercentage: { $round: ["$overallPercentage", 2] },
        totalMarksObtained: 1,
        totalMaxMarks: 1,
        semestersCompleted: "$uniqueSemesters",
      },
    },

    // Sort by overall percentage to get toppers
    { $sort: { overallPercentage: -1 } },
  ];
};

const formatResponse = (res, results) => {
  if (results.length) {
    const topperData = {
      allResults: results,
      overallTopper: results[0],
      semestersConsidered: results[0].semestersCompleted,
      totalStudentsAnalyzed: results.length,
    };

    return res.status(200).json({
      status: true,
      message: "Overall semester results fetched successfully",
      data: topperData,
    });
  } else {
    return res.status(404).json({
      status: false,
      message: "No students found who completed all specified semesters",
    });
  }
};

module.exports = {
  validateSemesterInput,
  buildAggregationPipeline,
  formatResponse,
};
