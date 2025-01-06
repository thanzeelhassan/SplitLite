const express = require("express");
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
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// Use routes
app.use("/", authRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to SplitLite");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
