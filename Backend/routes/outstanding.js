const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const router = express.Router();

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

// Get all settlements of a group
router.get(
  "/groups/:groupId/outstanding",
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
        outstanding: result,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while fetching group settlements.");
    }
  }
);

module.exports = router;
