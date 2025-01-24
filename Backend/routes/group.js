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

// Get all expenses of a group
router.get("/groups/:groupId/expenses", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    const result = await sql`
      SELECT e.expense_id, e.paid_by, e.amount, e.description, e.created_at, u.name, u.user_id
      FROM expenses e
      INNER JOIN users u ON u.user_id = e.paid_by
      WHERE e.group_id = ${groupId}
      ORDER BY e.created_at DESC;
    `;

    // Always return a 200 response, with an empty array if no expenses are found
    res.status(200).json({
      message:
        result.length > 0
          ? "Expenses retrieved successfully."
          : "No expenses found for this group.",
      expenses: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching group expenses.");
  }
});

// Get all settlements of a group
router.get(
  "/groups/:groupId/settlements",
  authenticateToken,
  async (req, res) => {
    try {
      const { groupId } = req.params;

      const result = await sql`
      SELECT s.settlement_id, s.payer_id, s.payee_id, s.amount, s.created_at, 
      u.user_id as user_id_payer, u.name as name_payer, 
      u2.user_id as user_id_payee, u2.name as name_payee
      FROM settlements s
      INNER JOIN users u ON u.user_id = s.payer_id
      INNER JOIN users u2 ON u2.user_id = s.payee_id
      WHERE s.group_id = ${groupId}
      ORDER BY s.created_at DESC;
    `;

      // Always return a 200 response, with an empty array if no settlements are found
      res.status(200).json({
        message:
          result.length > 0
            ? "Settlements retrieved successfully."
            : "No settlements found for this group.",
        settlements: result,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while fetching group settlements.");
    }
  }
);

// Get all participants of all expenses in a group
router.get(
  "/groups/:groupId/expenseparticipants",
  authenticateToken,
  async (req, res) => {
    try {
      const { groupId } = req.params;

      const result = await sql`
      SELECT e.expense_id, ep.expense_participant_id, e.paid_by, e.amount, ep.amount_owed, ep.user_id, 
      u.name as participant_name, e.created_at, e.description, u2.name as paid_by_name
      FROM expenses e
      INNER JOIN expenseparticipants ep on e.expense_id = ep.expense_id
      INNER JOIN users u on u.user_id = ep.user_id
      INNER JOIN users u2 on u2.user_id = e.paid_by
      WHERE e.group_id = ${groupId}
      ORDER BY e.created_at DESC;
    `;

      // Always return a 200 response, with an empty array if no expenseparticipants are found
      res.status(200).json({
        message:
          result.length > 0
            ? "Expense participants retrieved successfully."
            : "No expense participants found for this group.",
        expenseparticipants: result,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while fetching group expense participants.");
    }
  }
);

module.exports = router;
