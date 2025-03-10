// const validateUSN = (USN) => {
//   if (!USN) {
//     return {
//       status: false,
//       message: "USN is required",
//     };
//   }
//   return null;
// };

// const buildMatchStage = (studentId, semester) => {
//   let matchStage = { student: studentId };

//   // If semester is provided, handle single or multiple semesters
//   if (semester) {
//     if (Array.isArray(semester)) {
//       matchStage.semester = { $in: semester }; // If multiple semesters
//     } else {
//       matchStage.semester = semester; // If single semester
//     }
//   }
//   return matchStage;
// };

// const buildAggregationPipeline = (matchStage) => [
//   { $match: matchStage },
//   { $unwind: "$subjects" },
//   {
//     $addFields: {
//       "subjects.subjectPercentage": {
//         $multiply: [
//           { $divide: ["$subjects.marksObtained", "$subjects.maxMarks"] },
//           100,
//         ],
//       },
//     },
//   },
//   {
//     $group: {
//       _id: "$semester",
//       subjects: { $push: "$subjects" },
//       totalMarksObtained: { $sum: "$subjects.marksObtained" },
//       totalMaxMarks: { $sum: "$subjects.maxMarks" },
//     },
//   },
//   {
//     $addFields: {
//       semesterPercentage: {
//         $multiply: [
//           { $divide: ["$totalMarksObtained", "$totalMaxMarks"] },
//           100,
//         ],
//       },
//     },
//   },
//   {
//     $project: {
//       _id: 0,
//       semester: "$_id",
//       subjects: 1,
//       semesterPercentage: 1,
//     },
//   },
// ];

// const formatResponse = (res, results) => {
//   if (!results.length) {
//     return res.status(404).json({
//       status: false,
//       message: "No semester results found",
//     });
//   }

//   // Calculate overall percentage for the selected semesters
//   const totalPercentage = results.reduce(
//     (acc, sem) => acc + sem.semesterPercentage,
//     0
//   );
//   const overallPercentage = totalPercentage / results.length;

//   return res.status(200).json({
//     status: true,
//     message: "Semester results fetched successfully",
//     data: results,
//     overallPercentage: overallPercentage.toFixed(2), // Rounding to 2 decimal places
//   });
// };

// module.exports = {
//   validateUSN,
//   buildMatchStage,
//   buildAggregationPipeline,
//   formatResponse,
// };
const validateUSN = (USN) => {
  if (!USN) {
    return {
      status: false,
      message: "USN is required",
    };
  }
  return null;
};

const buildMatchStage = (studentId, semester) => {
  let matchStage = { student: studentId };

  // If semester is provided, handle single or multiple semesters
  if (semester) {
    if (Array.isArray(semester)) {
      matchStage.semester = { $in: semester }; // If multiple semesters
    } else {
      matchStage.semester = semester; // If single semester
    }
  }
  return matchStage;
};

const buildAggregationPipeline = (matchStage) => [
  { $match: matchStage },
  { $unwind: "$subjects" },
  {
    $addFields: {
      "subjects.subjectPercentage": {
        $multiply: [
          { $divide: ["$subjects.marksObtained", "$subjects.maxMarks"] },
          100,
        ],
      },
    },
  },
  {
    $group: {
      _id: "$semester",
      subjects: { $push: "$subjects" },
      totalMarksObtained: { $sum: "$subjects.marksObtained" },
      totalMaxMarks: { $sum: "$subjects.maxMarks" },
    },
  },
  {
    $addFields: {
      semesterPercentage: {
        $multiply: [
          { $divide: ["$totalMarksObtained", "$totalMaxMarks"] },
          100,
        ],
      },
    },
  },
  {
    $project: {
      _id: 0,
      semester: "$_id",
      subjects: 1,
      semesterPercentage: 1,
    },
  },
  // Sort semesters in ascending order (e.g., sem1, sem2, sem3, etc.)
  { $sort: { semester: 1 } },
];

const formatResponse = (res, results) => {
  if (!results.length) {
    return res.status(404).json({
      status: false,
      message: "No semester results found",
    });
  }

  // Organize results by semester (e.g., sem1, sem2, sem3)
  const organizedResults = results.reduce((acc, sem) => {
    const semesterKey = `sem${sem.semester.replace(/[^\d]/g, "")}`; // Creating keys like sem1, sem2, sem3
    acc[semesterKey] = {
      // semester: sem.semester,
      subjects: sem.subjects,
      semesterPercentage: sem.semesterPercentage,
    };
    return acc;
  }, {});

  // Calculate overall percentage for the selected semesters
  const totalPercentage = results.reduce(
    (acc, sem) => acc + sem.semesterPercentage,
    0
  );
  const overallPercentage = totalPercentage / results.length;

  return res.status(200).json({
    status: true,
    message: "Semester results fetched successfully",
    data: organizedResults, // Returning the organized results by semester
    overallPercentage: overallPercentage.toFixed(2), // Rounding to 2 decimal places
  });
};

module.exports = {
  validateUSN,
  buildMatchStage,
  buildAggregationPipeline,
  formatResponse,
};
