const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const {
  storeSettlements,
  getSettlements,
} = require("../cache/settlementCache");

const router = express.Router();

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

// Get all settlements of a group
router.get(
  "/groups/:groupId/settlements",
  authenticateToken,
  async (req, res) => {
    try {
      const { groupId } = req.params;

      // Check cache first
      const cachedSettlements = getSettlements(groupId);
      if (cachedSettlements.length > 0) {
        return res.status(200).json({
          message: "Settlements retrieved from cache.",
          settlements: cachedSettlements,
        });
      }

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

      // Store results in cache
      storeSettlements(groupId, result);
      // Always return a 200 response, with an empty array if no settlements are found

      res.status(200).json({
        message:
          result.length > 0
            ? "Settlements retrieved successfully."
            : "No settlements found.",
        settlements: result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching settlements.");
    }
  }
);

module.exports = router;
