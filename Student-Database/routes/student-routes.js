const express = require("express");
const {
  healthCheck,
  addnewStudent,
  getStudentDetails,
  getSingleStudentByUsn,
  updateStudentByUsn,
  deleteStudentById,
  getStudentCountByGender,
} = require("../controllers/student-controllers");

const {
  addSemesterData,
  editSemesterData,
  deleteSemesterData,
  getSemesterData,
} = require("../controllers/semester-controller");

const {
  getSemesterResults,
} = require("../controllers/semester-result.controller");

const {
  getSemesterResultsBySemester,
} = require("../controllers/semesterTopperResult");

const router = express.Router();

//all the routes
//health
router.get("/health", healthCheck);
//student routes
router.post("/add", addnewStudent);
router.post("/get", getStudentDetails);
router.get("/singleStudent/:USN", getSingleStudentByUsn);
router.put("/updateStudent/:USN", updateStudentByUsn);
router.delete("/deleteStudent/:USN", deleteStudentById);
router.get("/count", getStudentCountByGender);

//  route for adding  semester data
router.post("/addsemdata/:USN", addSemesterData);
// New route: Get semester data by USN
router.get("/getsemdata/:USN/:semester", getSemesterData);
// For editing semester data: both USN and semester passed in URL
router.put("/editsemdata/:USN/:semester", editSemesterData);
// For deleting semester data: both USN and semester passed in URL
router.delete("/deletesemdata/:USN/:semester", deleteSemesterData);

// get the result of each semester
router.post("/getsemesterresults", getSemesterResults);
//get sem topper
router.post("/getsemeTopper", getSemesterResultsBySemester);

module.exports = router;
