const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const { storeExpenses, getExpenses } = require("../cache/expensesCache");

const router = express.Router();

// Get all expenses of a group
router.get("/groups/:groupId/expenses", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check cache first
    const cachedExpenses = getExpenses(groupId);
    if (cachedExpenses.length > 0) {
      return res.status(200).json({
        message: "Expenses details retrieved from cache.",
        expenses: cachedExpenses,
      });
    }

    const result = await sql`
      SELECT e.expense_id, e.paid_by, e.amount, e.description, e.created_at, u.name, u.user_id
      FROM expenses e
      INNER JOIN users u ON u.user_id = e.paid_by
      WHERE e.group_id = ${groupId}
      ORDER BY e.created_at DESC;
    `;

    // Store results in cache
    storeExpenses(groupId, result);

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

// Add a new expense and participants
router.post("/expense", authenticateToken, async (req, res) => {
  try {
    const { group_id, paid_by, amount, description, participants } = req.body;

    // Default empty description if not provided
    const groupDescription = description ? description.trim() : null;

    // Insert the expense into the `expenses` table
    const expenseResult = await sql`
      INSERT INTO expenses (group_id, paid_by, amount, description, created_at)
      VALUES (${group_id}, ${paid_by}, ${amount}, ${groupDescription}, NOW())
      RETURNING expense_id, group_id, paid_by, amount, description, created_at;
    `;

    if (expenseResult.length === 0) {
      return res.status(500).send("Failed to add expense.");
    }

    const expense = expenseResult[0];
    const expenseId = expense.expense_id;

    // Insert participants into the `expenseparticipants` table
    if (participants && participants.length > 0) {
      const participantInserts = participants.map(
        ({ user_id, amount }) => sql`
          INSERT INTO expenseparticipants (expense_id, user_id, amount_owed)
          VALUES (${expenseId}, ${user_id}, ${amount})
          RETURNING expense_participant_id, expense_id, user_id, amount_owed;
        `
      );

      // Execute all participant inserts in parallel
      const participantResults = await Promise.all(participantInserts);

      // Flatten results for response
      const allParticipants = participantResults.map((result) => result[0]);

      return res.status(201).json({
        message: "Expense and participants added successfully.",
        expense,
        participants: allParticipants,
      });
    }

    // If no participants are provided, just return the expense
    res.status(201).json({
      message: "Expense added successfully (no participants provided).",
      expense,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while adding the expense.");
  }
});

module.exports = router;
