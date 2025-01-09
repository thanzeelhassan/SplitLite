const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

// Create a new group
router.post("/groups", authenticateToken, async (req, res) => {
  try {
    console.log(req.user);
    const { name, description } = req.body;

    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).send("Group name is required.");
    }

    // Default empty description if not provided
    const groupDescription = description ? description.trim() : null;

    // Insert the group into the database
    const result = await sql`
      INSERT INTO groups (name, description, created_by, created_at)
      VALUES (${name}, ${groupDescription}, ${req.user.user_id}, NOW())
      RETURNING group_id, name, description, created_by, created_at;
    `;

    if (result.length === 0) {
      return res.status(500).send("Failed to create group.");
    }

    const group = result[0];
    res.status(201).json({
      message: "Group created successfully.",
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while creating the group.");
  }
});

module.exports = router;
