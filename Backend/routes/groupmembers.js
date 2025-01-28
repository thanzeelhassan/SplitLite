const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");

const router = express.Router();

// Add a user into groupmembers table
router.post("/groupmembers", authenticateToken, async (req, res) => {
  try {
    console.log(req.user);
    const { group_id, user_id } = req.body;

    const result = await sql`
        INSERT INTO groupmembers (group_id, user_id)
        VALUES (${group_id}, ${user_id})
        RETURNING group_member_id, group_id, user_id, joined_at;
      `;

    if (result.length === 0) {
      return res.status(500).send("Failed to add group member.");
    }

    const group = result[0];
    res.status(201).json({
      message: "Group member added successfully.",
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while adding the group member.");
  }
});

module.exports = router;
