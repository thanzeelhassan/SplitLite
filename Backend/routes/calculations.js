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

      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    }

    if (!groupData.settlements || !Array.isArray(groupData.settlements)) {
      console.error("Error: settlements data is missing or not an array");
    }
    if (groupData.settlements.length === 0) {
      try {
        console.log("Fetching group settlements from API...");
        const apiUrl = `${req.protocol}://${req.get(
          "host"
        )}/groups/${group_id}/settlements`;

        console.log("apiURL : ", apiUrl);

        const token = req.cookies.authToken;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch group settlements: ${response.statusText}`
          );
        }

        const data = await response.json();
        groupData.settlements = data.settlements;

      } catch (error) {
        console.error("Error fetching group settlements:", error);
      }
    }

    if (!groupData.expenses || !Array.isArray(groupData.expenses)) {
      console.error("Error: expenses data is missing or not an array");
    }
    if (groupData.expenses.length === 0) {
      try {
        console.log("Fetching group expenses from API...");
        const apiUrl = `${req.protocol}://${req.get(
          "host"
        )}/groups/${group_id}/expenses`;

        console.log("apiURL : ", apiUrl);

        const token = req.cookies.authToken;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch group expenses: ${response.statusText}`
          );
        }

        const data = await response.json();
        groupData.expenses = data.expenses;

      } catch (error) {
        console.error("Error fetching group expenses:", error);
      }
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
      try {
        console.log("Fetching group expenseParticipants from API...");
        const apiUrl = `${req.protocol}://${req.get(
          "host"
        )}/groups/${group_id}/expenseparticipants`;

        console.log("apiURL : ", apiUrl);

        const token = req.cookies.authToken;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch group expenseParticipants: ${response.statusText}`
          );
        }

        const data = await response.json();
        groupData.expenseParticipants = data.expenseParticipants;

      } catch (error) {
        console.error("Error fetching group expenseParticipants:", error);
      }
    }
    console.log("Updated groupData:", groupData);

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
