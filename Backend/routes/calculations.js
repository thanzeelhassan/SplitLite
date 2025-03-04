const express = require("express");
const sql = require("../config/database");
const authenticateToken = require("../middleware/authenticatetoken");
const { calculate } = require("../services/calculationService");
const { getCachedItems } = require("../services/getAllCachedData");

const router = express.Router();

// Get all balance of a group
router.post("/calculations", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.body;

    console.log("Inside calculate method");
    const groupData = await getCachedItems(group_id); // Ensure it's awaited

    console.log("Received groupData:", groupData);

    console.log("groupData.users : ", groupData.users);

    if (!groupData || typeof groupData !== "object") {
      console.error("Error: groupData is undefined or not an object");
      return { error: "Failed to retrieve group data" };
    }

    if (!groupData.users || !Array.isArray(groupData.users)) {
      console.error("Error: users data is missing or not an array");
    }
    if (groupData.users.length === 0) {
      groupData.users = [11];
    }

    if (!groupData.groupMembers || !Array.isArray(groupData.groupMembers)) {
      console.error("Error: groupMembers data is missing or not an array");
    }
    if (groupData.groupMembers.length === 0) {
      try {
        console.log("Fetching group members from API...");
        const apiUrl = `${req.protocol}://${req.get(
          "host"
        )}/groups/${group_id}/members`;

        console.log("apiURL : ", apiUrl);

        const token = req.cookies.authToken;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Forward auth token if required
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch group members: ${response.statusText}`
          );
        }

        const data = await response.json();
        groupData.groupMembers = data.members; // Update with the fetched data

        console.log("Updated groupData:", groupData);
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    }

    if (!groupData.settlements || !Array.isArray(groupData.settlements)) {
      console.error("Error: settlements data is missing or not an array");
    }
    if (groupData.settlements.length === 0) {
      groupData.settlements = [
        {
          settlement_id: 7,
          payer_id: 13,
          payee_id: 11,
          amount: "100.00",
          created_at: "2025-01-21T03:18:09.905Z",
          user_id_payer: 13,
          name_payer: "kiran",
          user_id_payee: 11,
          name_payee: "thanzeelhassan",
        },
      ];
    }

    if (!groupData.expenses || !Array.isArray(groupData.expenses)) {
      console.error("Error: expenses data is missing or not an array");
    }
    if (groupData.expenses.length === 0) {
      groupData.expenses = [
        {
          expense_id: 15,
          paid_by: 13,
          amount: "500.00",
          description: "ola",
          created_at: "2025-01-24T03:09:42.690Z",
          name: "kiran",
          user_id: 13,
        },
        {
          expense_id: 14,
          paid_by: 11,
          amount: "1000.00",
          description: "swiggy",
          created_at: "2025-01-24T02:58:17.060Z",
          name: "thanzeelhassan",
          user_id: 11,
        },
        {
          expense_id: 11,
          paid_by: 11,
          amount: "300.00",
          description: "uber",
          created_at: "2025-01-21T03:12:11.640Z",
          name: "thanzeelhassan",
          user_id: 11,
        },
        {
          expense_id: 10,
          paid_by: 11,
          amount: "100.00",
          description: "momos",
          created_at: "2025-01-21T03:11:28.436Z",
          name: "thanzeelhassan",
          user_id: 11,
        },
      ];
    }

    if (
      !groupData.expenseParticipants ||
      !Array.isArray(groupData.expenseParticipants)
    ) {
      console.error(
        "Error: expenseParticipants data is missing or not an array"
      );
    }
    if (groupData.expenseParticipants.length === 0) {
      groupData.expenseParticipants = [
        {
          expense_id: 15,
          expense_participant_id: 11,
          paid_by: 13,
          amount: "500.00",
          amount_owed: "500.00",
          user_id: 11,
          participant_name: "thanzeelhassan",
          created_at: "2025-01-24T03:09:42.690Z",
          description: "ola",
          paid_by_name: "kiran",
        },
        {
          expense_id: 14,
          expense_participant_id: 10,
          paid_by: 11,
          amount: "1000.00",
          amount_owed: "500.00",
          user_id: 24,
          participant_name: "test",
          created_at: "2025-01-24T02:58:17.060Z",
          description: "swiggy",
          paid_by_name: "thanzeelhassan",
        },
        {
          expense_id: 14,
          expense_participant_id: 9,
          paid_by: 11,
          amount: "1000.00",
          amount_owed: "500.00",
          user_id: 11,
          participant_name: "thanzeelhassan",
          created_at: "2025-01-24T02:58:17.060Z",
          description: "swiggy",
          paid_by_name: "thanzeelhassan",
        },
        {
          expense_id: 11,
          expense_participant_id: 8,
          paid_by: 11,
          amount: "300.00",
          amount_owed: "100.00",
          user_id: 24,
          participant_name: "test",
          created_at: "2025-01-21T03:12:11.640Z",
          description: "uber",
          paid_by_name: "thanzeelhassan",
        },
        {
          expense_id: 11,
          expense_participant_id: 6,
          paid_by: 11,
          amount: "300.00",
          amount_owed: "100.00",
          user_id: 11,
          participant_name: "thanzeelhassan",
          created_at: "2025-01-21T03:12:11.640Z",
          description: "uber",
          paid_by_name: "thanzeelhassan",
        },
        {
          expense_id: 11,
          expense_participant_id: 7,
          paid_by: 11,
          amount: "300.00",
          amount_owed: "100.00",
          user_id: 13,
          participant_name: "kiran",
          created_at: "2025-01-21T03:12:11.640Z",
          description: "uber",
          paid_by_name: "thanzeelhassan",
        },
        {
          expense_id: 10,
          expense_participant_id: 4,
          paid_by: 11,
          amount: "100.00",
          amount_owed: "50.00",
          user_id: 11,
          participant_name: "thanzeelhassan",
          created_at: "2025-01-21T03:11:28.436Z",
          description: "momos",
          paid_by_name: "thanzeelhassan",
        },
        {
          expense_id: 10,
          expense_participant_id: 5,
          paid_by: 11,
          amount: "100.00",
          amount_owed: "50.00",
          user_id: 13,
          participant_name: "kiran",
          created_at: "2025-01-21T03:11:28.436Z",
          description: "momos",
          paid_by_name: "thanzeelhassan",
        },
      ];
    }
    // console.log("Updated groupData:", groupData);

    const receivables = calculateOutstanding(groupData);

    res.json({
      group_id: group_id,
      receivables: receivables,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error doing calculations");
  }
});

function calculateOutstanding(groupData) {
  console.log("Inside calculateOutstanding method");

  const settlements = groupData.settlements || [];
  const expenseParticipants = groupData.expenseParticipants || [];

  const outstandingBalances = {};

  // Step 1: Track amounts owed
  expenseParticipants.forEach(({ user_id, amount_owed }) => {
    if (!outstandingBalances[user_id]) {
      outstandingBalances[user_id] = 0;
    }
    outstandingBalances[user_id] += parseFloat(amount_owed);
  });

  // Step 2: Track settlements
  settlements.forEach(({ payer_id, payee_id, amount }) => {
    const paidAmount = parseFloat(amount);
    if (!outstandingBalances[payer_id]) {
      outstandingBalances[payer_id] = 0;
    }
    outstandingBalances[payer_id] -= paidAmount;

    if (!outstandingBalances[payee_id]) {
      outstandingBalances[payee_id] = 0;
    }
    outstandingBalances[payee_id] += paidAmount;
  });

  return Object.entries(outstandingBalances).map(([userId, balance]) => ({
    user_id: Number(userId),
    balance: balance.toFixed(2),
  }));
}

module.exports = router;
