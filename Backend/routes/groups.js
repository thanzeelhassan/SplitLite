const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const { calculateUserReceivables } = require("../services/outstandingService");
const { calculateOutstanding } = require("../services/getAllCachedData");

const { storeGroups, getGroups } = require("../cache/groupCache");
const { calculate } = require("../services/calculationService");

const router = express.Router();

// Get all groups a user is part of
router.get("/groups", authenticateToken, async (req, res) => {
  try {
    // Check cache first
    const cachedGroups = getGroups(req.user.user_id);
    if (cachedGroups.length > 0) {
      return res.status(200).json({
        message: "Groups retrieved from cache.",
        groups: cachedGroups,
      });
    }

    // Fetch all groups the user is part of
    const groups = await sql`
      SELECT g.group_id, g.name, g.description, u.name as created_by, g.created_at 
      FROM groups g
      INNER JOIN groupmembers gm ON g.group_id = gm.group_id
      INNER JOIN users u ON gm.user_id = u.user_id
      WHERE gm.user_id = ${req.user.user_id}
      ORDER BY g.created_at DESC;
    `;

    if (groups.length === 0) {
      return res.status(404).json({ message: "No groups found." });
    }

    // Store results in cache
    storeGroups(req.user.user_id, cachedGroups);

    // const groupsWithBalance = await Promise.all(
    //   groups.map(async (group) => {
    //     try {
    //       const receivables = await calculate(group.group_id);

    //       let groupBalance = 0;

    //       if (receivables && receivables.length > 0) {
    //         const userReceivable = receivables.find(
    //           (r) => r.user_id === req.user.user_id
    //         );

    //         if (userReceivable) {
    //           groupBalance = parseFloat(userReceivable.balance);
    //         }
    //       }

    //       return {
    //         ...group,
    //         balance: groupBalance,
    //       };
    //     } catch (err) {
    //       console.error(`Error for group ${group.group_id}:`, err);
    //       return group; // Return group without receivables on error
    //     }
    //   })
    // );

    res.status(200).json({
      message: "Groups retrieved successfully.",
      // totalBalance: totalBalance, // Total amount user owes
      groups: groups,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching the groups.");
  }
});

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

// Delete a group
router.delete("/delete_group", authenticateToken, async (req, res) => {
  console.log("Deleting group");
  try {
    const { group_name } = req.body;

    if (!group_name) {
      return res.status(400).send("Group name is required");
    }

    const user = await sql`
      SELECT * FROM groups 
      WHERE name = ${group_name} ;
    `;
    if (user.length === 0) {
      return res.status(404).send("Group not found");
    }

    const result = await sql`
      DELETE FROM groups 
      WHERE group_id = ${group_id} 
        AND name = ${name};
    `;

    if (result.length === 0) {
      res.status(200).send(`Deleted group ${group_name}`);
    } else {
      res.status(400).send("Failed to delete group");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting group");
  }
});

module.exports = router;
