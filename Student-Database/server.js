require("dotenv").config();

// Importing required modules
const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/student-routes");
const ConnectToBD = require("./database/student-database");

// Initialize Express app
const app = express();

// ✅ Enable CORS for frontend (React on port 5173)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Middleware
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to database
ConnectToBD();

// Parent route
app.use("/api/student", studentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
