const sql = require("../config/database");
const { getSettlements } = require("../cache/settlementCache");
const { getExpenses } = require("../cache/expensesCache");
const { getExpenseParticipants } = require("../cache/expenseParticipantsCache");
const { getGroups } = require("../cache/groupCache");
const { getGroupMembers } = require("../cache/groupMembersCache");
const {
  getOutstandings,
  storeOutstandings,
} = require("../cache/outstandingCache");
const { getUsers } = require("../cache/userCache");
const { getCachedItems } = require("../services/getAllCachedData");

async function calculate(groupId) {
  const groupData = await getCachedItems(groupId); // Ensure it's awaited

  // console.log("Received groupData:", groupData);

  if (!groupData || typeof groupData !== "object") {
    console.error("Error: groupData is undefined or not an object");
    return { error: "Failed to retrieve group data" };
  }

  if (!groupData.settlements || !Array.isArray(groupData.settlements)) {
    console.error("Error: settlements data is missing or not an array");
    groupData.settlements = []; // Default to empty array
  }

  if (
    !groupData.expenseParticipants ||
    !Array.isArray(groupData.expenseParticipants)
  ) {
    console.error("Error: expenseParticipants data is missing or not an array");
    groupData.expenseParticipants = []; // Default to empty array
  }

  const receivables = calculateOutstanding(groupData);
  return receivables;
}

function calculateOutstanding(groupData) {
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

module.exports = { calculate };
