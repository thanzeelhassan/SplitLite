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
  const groupData = await getCachedItems(groupId);

  console.log("Received groupData:", groupData);

  if (!groupData || typeof groupData !== "object") {
    console.error("Error: groupData is undefined or not an object");
    return { error: "Failed to retrieve group data" };
  }

  const receivables = calculateOutstanding(groupData);

  return {
    group_id: groupId,
    receivables, // Removed extra layer
  };
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

  // Step 3: Compute debts - Who owes whom?
  const transactions = resolveDebts(outstandingBalances);

  return transactions;
}

function resolveDebts(balances) {
  const creditors = [];
  const debtors = [];

  // Separate users into creditors (positive balance) and debtors (negative balance)
  Object.entries(balances).forEach(([userId, balance]) => {
    const amount = parseFloat(balance.toFixed(2)); // Round to 2 decimal places
    if (amount > 0) {
      creditors.push({ user_id: Number(userId), balance: amount });
    } else if (amount < 0) {
      debtors.push({ user_id: Number(userId), balance: -amount });
    }
  });

  const transactions = [];

  // Settle debts
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0]; // Take the first debtor
    const creditor = creditors[0]; // Take the first creditor

    const amount = Math.min(debtor.balance, creditor.balance);

    transactions.push({
      from: debtor.user_id,
      to: creditor.user_id,
      amount: amount.toFixed(2),
    });

    // Reduce their balances
    debtor.balance -= amount;
    creditor.balance -= amount;

    // Remove settled users
    if (debtor.balance === 0) debtors.shift();
    if (creditor.balance === 0) creditors.shift();
  }

  return transactions;
}

module.exports = { calculate };
