const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const { calculate } = require("../services/calculationService");

const router = express.Router();

// Get all balance of a group
router.post("/calculations", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.body;

    const receivables = await calculate(group_id);

    res.json({
      group_id: group_id,
      receivables: receivables,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error doing calculations");
  }
});

module.exports = router;
