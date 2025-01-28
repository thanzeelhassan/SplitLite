const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");

const router = express.Router();

// Create a new group
router.post("/groups", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).send("Group name is required.");
    }

    // Default empty description if not provided
    const groupDescription = description ? description.trim() : null;

    const groupResult = await sql`
      INSERT INTO groups (name, description, created_by, created_at)
      VALUES (${name}, ${groupDescription}, ${req.user.user_id}, NOW())
      RETURNING group_id, name, description, created_by, created_at;
    `;

    if (groupResult.length === 0) {
      return res.status(500).send("Failed to create group.");
    }

    const group = groupResult[0];

    // Insert into groupmembers table
    const result = await sql`
      INSERT INTO groupmembers (group_id, user_id)
      VALUES (${group.group_id}, ${req.user.user_id})
      RETURNING group_member_id, group_id, user_id, joined_at;
    `;

    if (groupResult.length === 0) {
      return res.status(500).send("Failed to create group.");
    }

    res.status(201).json({
      message: "Group created successfully.",
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while creating the group.");
  }
});

// Get all groups a user is part of
router.get("/groups", authenticateToken, async (req, res) => {
  try {
    // Fetch all groups the user is part of
    const result = await sql`
      SELECT g.group_id, g.name, g.description, u.name as created_by, g.created_at 
      FROM groups g
      INNER JOIN groupmembers gm ON g.group_id = gm.group_id
      INNER JOIN users u ON gm.user_id = u.user_id
      WHERE gm.user_id = ${req.user.user_id}
      ORDER BY g.created_at DESC;
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "No groups found." });
    }

    res.status(200).json({
      message: "Groups retrieved successfully.",
      groups: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the groups.");
  }
});

// Get all members of a group
router.get("/groups/:groupId/members", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await sql`
      SELECT u.user_id, u.name, u.email
      FROM users u
      INNER JOIN groupmembers gm ON u.user_id = gm.user_id
      WHERE gm.group_id = ${groupId};
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No members found for this group." });
    }

    res.status(200).json({
      message: "Members retrieved successfully.",
      members: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching group members.");
  }
});

module.exports = router;
