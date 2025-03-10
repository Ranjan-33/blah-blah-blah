const Student = require("../models/student");

//health check
const healthCheck = async (req, res) => {
  return res.status(200).json({ message: "server jindaa hai " });
};

//studennt detils
const addnewStudent = async (req, res) => {
  try {
    const NewStudentFormData = req.body;
    const newlyAddeedStudent = await Student.create(NewStudentFormData);
    if (newlyAddeedStudent) {
      res.status(201).json({
        status: true,
        message: "Student added successfully",
        data: newlyAddeedStudent,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error please try again ",
    });
  }
};
const getStudentDetails = async (req, res) => {
  try {
    // Extract parameters from request body
    const { gender, page = 1, limit = 10 } = req.body;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build a match stage for filtering by gender if provided.
    // If gender is an array, use $in to match any provided value.
    const matchStage = {};
    if (gender) {
      if (Array.isArray(gender) && gender.length > 0) {
        matchStage.gender = { $in: gender };
      } else if (!Array.isArray(gender) && gender !== "") {
        matchStage.gender = gender;
      }
    }

    // Build the aggregation pipeline with three facets:
    // 1. metadata: counts total students and adds current page info
    // 2. data: paginates the records using skip and limit
    // 3. genderCounts: groups by gender and counts documents per group
    const aggregationPipeline = [
      { $match: matchStage },
      {
        $facet: {
          metadata: [
            { $count: "totalStudents" },
            { $addFields: { currentPage: pageNumber } },
          ],
          data: [{ $skip: skip }, { $limit: limitNumber }],
          genderCounts: [{ $group: { _id: "$gender", count: { $sum: 1 } } }],
        },
      },
    ];

    // Run the aggregation pipeline
    const results = await Student.aggregate(aggregationPipeline);

    // Extract facets from the aggregation result
    const facetResult = results[0] || {};
    const metadata = facetResult.metadata[0] || {
      totalStudents: 0,
      currentPage: pageNumber,
    };
    const data = facetResult.data || [];
    const genderCountsArray = facetResult.genderCounts || [];

    // Convert genderCounts array into an object, e.g. { "Male": 10, "Female": 15 }
    const genderCounts = genderCountsArray.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Respond with the aggregated data
    if (data.length) {
      return res.status(200).json({
        status: true,
        message: "All Students Details fetched successfully",
        data: data,
        pagination: {
          totalStudents: metadata.totalStudents,
          totalPages: Math.ceil(metadata.totalStudents / limitNumber),
          currentPage: pageNumber,
          pageSize: limitNumber,
        },
        genderCounts: genderCounts, // e.g., { "Male": 10, "Female": 15 }
      });
    }

    res.status(400).json({
      status: false,
      message: "No Student Found",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error, please try again",
    });
  }
};

const getSingleStudentByUsn = async (req, res) => {
  try {
    const usn = req.params.USN;
    const student = await Student.findOne({ USN: usn });
    if (!student) {
      return res.status(404).json({
        status: false,
        message: "Student not found on this USN",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Student found on this USN",
      data: student,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error please try again ",
    });
  }
};
const updateStudentByUsn = async (req, res) => {
  try {
    const UpdateStudentFromData = req.body;
    const usn = req.params.USN;
    const updatedStudent = await Student.findOneAndUpdate(
      { USN: usn },
      UpdateStudentFromData,
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({
        status: false,
        message: "Student not found on this USN",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error please try again ",
    });
  }
};
const deleteStudentById = async (req, res) => {
  try {
    const usn = req.params.USN;
    const deletedStudent = await Student.findOneAndDelete({ USN: usn });
    if (!deletedStudent) {
      return res.status(404).json({
        status: false,
        message: "Student not found on this USN",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Student deleted successfully",
      data: deletedStudent,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error please try again ",
    });
  }
};
//count of students
const getStudentCountByGender = async (req, res) => {
  try {
    const { gender } = req.query;
    const filter = {};

    if (gender) {
      filter.gender = gender;
    }

    const totalStudents = await Student.countDocuments(filter);

    res.status(200).json({
      status: true,
      message: "Student count fetched successfully",
      gender: gender || "All",
      count: totalStudents,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  healthCheck,
  addnewStudent,
  getStudentDetails,
  getSingleStudentByUsn,
  updateStudentByUsn,
  deleteStudentById,
  getStudentCountByGender,
};
