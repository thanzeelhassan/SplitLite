const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
const authRoutes = require("../routes/auth");
const userRoutes = require("../routes/users");
const groupRoutes = require("../routes/groups");
const groupmembersRoutes = require("../routes/groupmembers");
const expenseRoutes = require("../routes/expenses");
const settlementRoutes = require("../routes/settlements");
const expenseparticipantsRoutes = require("../routes/expenseparticipants");
const outstandingRoutes = require("../routes/outstanding");
const calculationsRoutes = require("../routes/calculations");

// Use routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", groupRoutes);
app.use("/", groupmembersRoutes);
app.use("/", expenseRoutes);
app.use("/", settlementRoutes);
app.use("/", expenseparticipantsRoutes);
app.use("/", outstandingRoutes);
app.use("/", calculationsRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to SplitLite");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
module.exports.handler = serverless(app);