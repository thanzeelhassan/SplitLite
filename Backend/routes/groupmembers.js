const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const { storeGroupMembers, getGroupMembers } = require("../cache/groupMembersCache");

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

// Get all members of a group
router.get("/groups/:groupId/members", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check cache first
    const cachedGroupMembers = getGroupMembers(groupId);
    if (cachedGroupMembers.length > 0) {
      return res.status(200).json({
        message: "Group members details retrieved from cache.",
        members: cachedGroupMembers,
      });
    }

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

    // Store cache
    storeGroupMembers(groupId, result)

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
