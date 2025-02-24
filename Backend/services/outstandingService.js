// services/outstandingService.js
const sql = require("../config/database");

async function calculateUserReceivables(group_id) {
  // Validate input
  if (!group_id) return { "message ": "Group ID is required." };

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

  return {
    group_id,
    outstanding_balances: formatted,
  };
}

module.exports = { calculateUserReceivables };
