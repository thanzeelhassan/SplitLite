const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

const JWT_SECRET = "HdZXv90sPpwccnGbVGotaIVdAlk9SW39";
const JWT_EXPIRATION = "1h";

// Register
router.post("/register", async (req, res) => {
  console.log("Registering");
  try {
    const { username, email, phone, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).send("Password and confirm password do not match");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let result;
    if (phone) {
      result =
        await sql`INSERT INTO users (name, email, phone_number, password) VALUES (${username}, ${email}, ${phone}, ${hashedPassword});`;
    } else {
      result =
        await sql`INSERT INTO users (name, email, password) VALUES (${username}, ${email}, ${hashedPassword});`;
    }
    if (result.length === 0) {
      res.status(200).send(`Registered user ${username} with email ${email}`);
    } else {
      res.status(400).send("Failed to register");
    }
  } catch (err) {
    console.error(err);
    res.status(400).send("Error occurred while registering.");
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("Login");
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
      { id: user.id, email: user.email, name: user.name },
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
      user: { id: user.id, name: user.name, email: user.email },
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
  res.status(200).send("Logged out successfully.");
});

//protected
router.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({
    message: `Hello, ${req.user.name}. You are authorized!`,
    user: req.user, // Optionally include more user data
  });
});

module.exports = router;
