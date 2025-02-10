const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const {
  storeExpenseParticipants,
  getExpenseParticipantCache,
} = require("../cache/expenseParticipantsCache");

const router = express.Router();

// Get all participants of all expenses in a group
router.get(
  "/groups/:groupId/expenseparticipants",
  authenticateToken,
  async (req, res) => {
    try {
      const { groupId } = req.params;

      // Check cache first
      const cachedExpenseParticipants = getExpenseParticipantCache(groupId);
      if (cachedExpenseParticipants.length > 0) {
        return res.status(200).json({
          message: "Expense participants details retrieved from cache.",
          expenseparticipants: cachedExpenseParticipants,
        });
      }

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

      storeExpenseParticipants(groupId, result);
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

// Add a new expense participant
router.post("/expenseparticipants", authenticateToken, async (req, res) => {
  try {
    const { expense_id, user_id, amount } = req.body;

    const result = await sql`
      INSERT INTO expenseparticipants (expense_id, user_id, amount_owed)
      VALUES (${expense_id}, ${user_id}, ${amount})
      RETURNING expense_participant_id, expense_id, user_id, amount_owed;
    `;

    if (result.length === 0) {
      return res.status(500).send("Failed to add expense.");
    }

    const group = result[0];
    res.status(201).json({
      message: "Expense added successfully.",
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while adding the expense.");
  }
});

module.exports = router;
