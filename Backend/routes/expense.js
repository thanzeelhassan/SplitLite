const express = require('express');
const sql = require('../config/database');
const authenticateToken = require('../middleware/authenticate');

const router = express.Router();

// Add a new expense
router.post('/expense', authenticateToken, async (req, res) => {
    try {
        const { group_id, paid_by, amount, description } = req.body;

        // Default empty description if not provided
        const groupDescription = description ? description.trim() : null;

        // Insert the group into the database
        const result = await sql`
      INSERT INTO expenses (group_id, paid_by, amount, description, created_at)
      VALUES (${group_id}, ${paid_by}, ${amount}, ${description}, NOW())
      RETURNING expense_id, group_id, paid_by, amount, description, created_at;
    `;

        if (result.length === 0) {
            return res.status(500).send('Failed to add expense.');
        }

        const group = result[0];
        res.status(201).json({
            message: 'Expense added successfully.',
            group,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while adding the expense.');
    }
});

// Add a new settlement
router.post('/settlement', authenticateToken, async (req, res) => {
    try {
        const { group_id, payer_id, payee_id, amount } = req.body;

        // Insert the group into the database
        const result = await sql`
      INSERT INTO settlements (group_id, payer_id, payee_id, amount, created_at)
      VALUES (${group_id}, ${payer_id}, ${payee_id}, ${amount}, NOW())
      RETURNING settlement_id, group_id, payer_id, payee_id, amount, created_at;
    `;

        if (result.length === 0) {
            return res.status(500).send('Failed to add settlement.');
        }

        const group = result[0];
        res.status(201).json({
            message: 'Settlement added successfully.',
            group,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while adding the settlement.');
    }
});

module.exports = router;
