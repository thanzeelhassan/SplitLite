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

      // Calculate net outstanding amount with a single query
      const result = await sql`
        WITH 
          u1_owes_u2 AS (
            SELECT COALESCE(SUM(ep.amount_owed), 0) - 
                   COALESCE(SUM(s.amount), 0) AS net
            FROM expenses e
            JOIN expenseparticipants ep ON e.expense_id = ep.expense_id
            LEFT JOIN settlements s 
              ON s.payer_id = ${user1_id} AND s.payee_id = ${user2_id}
            WHERE e.paid_by = ${user2_id} AND ep.user_id = ${user1_id}
          ),
          u2_owes_u1 AS (
            SELECT COALESCE(SUM(ep.amount_owed), 0) - 
                   COALESCE(SUM(s.amount), 0) AS net
            FROM expenses e
            JOIN expenseparticipants ep ON e.expense_id = ep.expense_id
            LEFT JOIN settlements s 
              ON s.payer_id = ${user2_id} AND s.payee_id = ${user1_id}
            WHERE e.paid_by = ${user1_id} AND ep.user_id = ${user2_id}
          )
        SELECT 
          (SELECT net FROM u1_owes_u2) - 
          (SELECT net FROM u2_owes_u1) AS outstanding_amount
      `;

      const outstandingAmount = result[0].outstanding_amount;

      res.status(200).json({
        message: "Outstanding amount calculated successfully.",
        user1_id,
        user2_id,
        outstanding_amount: outstandingAmount,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error calculating outstanding amount.");
    }
  }
);

// Get all outstandings of a group
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

router.post("/groupOutstanding", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.body;

    // Validate input
    if (!group_id) return res.status(400).send("Group ID is required.");

    // Check group existence
    const [group] = await sql`
      SELECT 1 FROM Groups WHERE group_id = ${group_id}
    `;
    if (!group) return res.status(404).send("Group not found.");

    // Calculate balances using optimized SQL
    const balances = await sql`
      WITH user_pairs AS (
        SELECT u1.user_id AS user1, u2.user_id AS user2
        FROM groupmembers u1
        JOIN groupmembers u2 ON u1.group_id = u2.group_id 
          AND u1.user_id < u2.user_id
        WHERE u1.group_id = ${group_id}
      ),
      expense_balances AS (
        SELECT
          e.paid_by,
          ep.user_id AS participant,
          SUM(ep.amount_owed) AS owed
        FROM expenses e
        JOIN expenseparticipants ep ON e.expense_id = ep.expense_id
        WHERE e.group_id = ${group_id}
        GROUP BY e.paid_by, ep.user_id
      ),
      settlement_balances AS (
        SELECT
          payer_id,
          payee_id,
          SUM(amount) AS settled
        FROM settlements
        WHERE group_id = ${group_id}
        GROUP BY payer_id, payee_id
      )
      SELECT
        p.user1,
        p.user2,
        COALESCE(SUM(
          CASE
            WHEN eb.paid_by = p.user2 AND eb.participant = p.user1 THEN eb.owed
            WHEN eb.paid_by = p.user1 AND eb.participant = p.user2 THEN -eb.owed
            ELSE 0
          END
        ), 0) -
        COALESCE(SUM(
          CASE
            WHEN sb.payer_id = p.user1 AND sb.payee_id = p.user2 THEN sb.settled
            WHEN sb.payer_id = p.user2 AND sb.payee_id = p.user1 THEN -sb.settled
            ELSE 0
          END
        ), 0) AS net_balance
      FROM user_pairs p
      LEFT JOIN expense_balances eb ON
        (eb.paid_by = p.user1 AND eb.participant = p.user2) OR
        (eb.paid_by = p.user2 AND eb.participant = p.user1)
      LEFT JOIN settlement_balances sb ON
        (sb.payer_id = p.user1 AND sb.payee_id = p.user2) OR
        (sb.payer_id = p.user2 AND sb.payee_id = p.user1)
      GROUP BY p.user1, p.user2
      HAVING ABS(
        COALESCE(SUM(
          CASE
            WHEN eb.paid_by = p.user2 AND eb.participant = p.user1 THEN eb.owed
            WHEN eb.paid_by = p.user1 AND eb.participant = p.user2 THEN -eb.owed
            ELSE 0
          END
        ), 0) -
        COALESCE(SUM(
          CASE
            WHEN sb.payer_id = p.user1 AND sb.payee_id = p.user2 THEN sb.settled
            WHEN sb.payer_id = p.user2 AND sb.payee_id = p.user1 THEN -sb.settled
            ELSE 0
          END
        ), 0)
      ) > 0
    `;

    // Format the results
    const formatted = balances.map((row) => ({
      debtor_id: row.net_balance > 0 ? row.user1 : row.user2,
      creditor_id: row.net_balance > 0 ? row.user2 : row.user1,
      amount: Math.abs(row.net_balance),
    }));

    res.json({
      group_id,
      outstanding_balances: formatted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error calculating group balances");
  }
});

module.exports = router;
