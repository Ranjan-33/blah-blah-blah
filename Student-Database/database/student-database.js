const mongoose = require("mongoose");
const ConnectToBD = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://testrk33:studentDB@student-db.y9fyy.mongodb.net/?retryWrites=true&w=majority&appName=Student-Db"
    );
    console.log("mongodb connected successfully");
  } catch (err) {
    console.log("Error while connecting to DB", err);
    process.exit(1);
  }
};
module.exports = ConnectToBD;
///
