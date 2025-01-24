const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticate");

const router = express.Router();

// Add a new expense
router.post("/expense", authenticateToken, async (req, res) => {
  try {
    const { group_id, paid_by, amount, description } = req.body;

    // Default empty description if not provided
    const groupDescription = description ? description.trim() : null;

    const result = await sql`
      INSERT INTO expenses (group_id, paid_by, amount, description, created_at)
      VALUES (${group_id}, ${paid_by}, ${amount}, ${description}, NOW())
      RETURNING expense_id, group_id, paid_by, amount, description, created_at;
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

// Add a new settlement
router.post("/settlement", authenticateToken, async (req, res) => {
  try {
    const { group_id, payer_id, payee_id, amount } = req.body;

    const result = await sql`
      INSERT INTO settlements (group_id, payer_id, payee_id, amount, created_at)
      VALUES (${group_id}, ${payer_id}, ${payee_id}, ${amount}, NOW())
      RETURNING settlement_id, group_id, payer_id, payee_id, amount, created_at;
    `;

    if (result.length === 0) {
      return res.status(500).send("Failed to add settlement.");
    }

    const group = result[0];
    res.status(201).json({
      message: "Settlement added successfully.",
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while adding the settlement.");
  }
});

// Add a new expense
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

// Get the outstanding amount between two users
router.post(
  "/outstandingBetween2Users",
  authenticateToken,
  async (req, res) => {
    try {
      const { user1_id, user2_id } = req.body;

      if (!user1_id || !user2_id) {
        return res.status(400).send("Both user IDs are required.");
      }

      // Calculate the amount user1 owes user2
      const user1OwesUser2 = await sql`
            SELECT COALESCE(SUM(amount_owed), 0) AS total
            FROM (
                SELECT amount_owed
                FROM expenses e
                JOIN expenseparticipants ep ON e.expense_id = ep.expense_id
                WHERE e.paid_by = ${user2_id} AND ep.user_id = ${user1_id}

                UNION ALL

                SELECT -amount
                FROM settlements
                WHERE payer_id = ${user1_id} AND payee_id = ${user2_id}
            ) subquery;
        `;

      // Calculate the amount user2 owes user1
      const user2OwesUser1 = await sql`
            SELECT COALESCE(SUM(amount_owed), 0) AS total
            FROM (
                SELECT amount_owed
                FROM expenses e
                JOIN expenseparticipants ep ON e.expense_id = ep.expense_id
                WHERE e.paid_by = ${user1_id} AND ep.user_id = ${user2_id}

                UNION ALL

                SELECT -amount
                FROM settlements
                WHERE payer_id = ${user2_id} AND payee_id = ${user1_id}
            ) subquery;
        `;

      const totalUser1Owes = user1OwesUser2[0].total;
      const totalUser2Owes = user2OwesUser1[0].total;

      const outstandingAmount = totalUser1Owes - totalUser2Owes;

      res.status(200).json({
        message: "Outstanding amount calculated successfully.",
        user1_id,
        user2_id,
        outstanding_amount: outstandingAmount,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while calculating the outstanding amount.");
    }
  }
);

module.exports = router;
