const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const { getCachedItems } = require("../services/getAllCachedData");
const router = express.Router();

// Get all balance of a group
router.post("/calculations", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.body;

    const receivables = await getCachedItems(group_id);



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
