const express = require("express");
const bcrypt = require("bcrypt");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

// Get users count
router.get("/users", async (req, res) => {
  const result = await sql`SELECT count(*) FROM users`;
  const { count } = result[0];

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Number of users in the database: ");
  res.end(count);
});

// Delete user
router.delete("/delete", async (req, res) => {
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

//profile
router.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

router.post("/users/email", authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    const result = await sql`
        SELECT user_id, name, email, phone_number, created_at 
        FROM users
        WHERE email = ${email};
      `;

    if (result.length === 0) {
      return res.status(500).send("Failed to get user details with email.");
    }

    const user = result[0];
    res.status(201).json({
      message: "User details fetched successfully.",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the user details.");
  }
});

module.exports = router;
