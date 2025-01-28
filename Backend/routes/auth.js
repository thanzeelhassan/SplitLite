const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");

const router = express.Router();

const JWT_SECRET = "HdZXv90sPpwccnGbVGotaIVdAlk9SW39";
const JWT_EXPIRATION = "1h";

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.length === 0) {
      return res.status(404).send("User not found.");
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid password.");
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone_number,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: `Welcome back, ${user.name}!`,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone_number,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred while logging in.");
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.status(200).json({
    message: "Logged out successfully.",
  });
});

//protected
router.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({
    message: `Hello, ${req.user.name}. You are authorized!`,
    user: req.user,
  });
});

module.exports = router;
