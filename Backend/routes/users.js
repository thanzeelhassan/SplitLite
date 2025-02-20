const express = require("express");
const bcrypt = require("bcrypt");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const { storeEmails, getEmails } = require("../cache/emailCache");

const router = express.Router();

// Get users count
router.get("/users", authenticateToken, async (req, res) => {
  const result = await sql`SELECT count(*) FROM users`;
  const { count } = result[0];

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Number of users in the database: ");
  res.end(count);
});

// Register a user
router.post("/register", async (req, res) => {
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
      res.status(200).json({
        message: `Registered user ${username} with email ${email}`,
      });
    } else {
      res.status(400).send("Failed to register");
    }
  } catch (err) {
    console.error(err);
    res.status(400).send("Error occurred while registering.");
  }
});

// Delete a user
router.delete("/delete_user", authenticateToken, async (req, res) => {
  console.log("Deleting user");
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res
        .status(400)
        .send("Username, email, phone, and password are required");
    }

    const user = await sql`
      SELECT password FROM users 
      WHERE name = ${username} 
        AND email = ${email} 
        AND phone_number = ${phone};
    `;
    if (user.length === 0) {
      return res.status(404).send("User not found");
    }

    const hashedPassword = user[0].password;
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) {
      return res.status(401).send("Invalid credentials");
    }

    const result = await sql`
      DELETE FROM users 
      WHERE name = ${username} 
        AND email = ${email} 
        AND phone_number = ${phone};
    `;

    if (result.length === 0) {
      res.status(200).send(`Deleted user ${username}`);
    } else {
      res.status(400).send("Failed to delete user");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

// get user details with email
router.post("/users/email", authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    // Check cache first
    const cachedUser = getEmails(email);
    if (cachedUser.length > 0) {
      return res.status(200).json({
        message: "User details retrieved from cache.",
        user: cachedUser,
      });
    }

    const result = await sql`
        SELECT user_id, name, email, phone_number, created_at 
        FROM users
        WHERE email = ${email};
      `;

    if (result.length === 0) {
      return res.status(500).send("Failed to get user details with email.");
    }

    const user = result[0];
    // Store results in cache
    storeEmails(email, user);

    res.status(201).json({
      message: "User details fetched successfully.",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the user details.");
  }
});

// get user profile
router.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

module.exports = router;
