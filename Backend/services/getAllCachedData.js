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

async function getCachedItems(groupId) {
  const settlements = getSettlements(groupId);
  const users = getUsers(groupId);
  const groupMembers = getGroupMembers(groupId);
  const expenses = getExpenses(groupId);
  const expenseParticipants = getExpenseParticipants(groupId);

  return {
    users: users,
    settlements: settlements,
    groupMembers: groupMembers,
    expenses: expenses,
    expenseParticipants: expenseParticipants,
  };
}

async function miscFunction(groupId) {
  // Fetch receivables for each group
  let totalBalance = 0; // Total amount user owes
  const groupsWithReceivables = await Promise.all(
    groups.map(async (group) => {
      try {
        const receivables = await calculateUserReceivables(group.group_id);

        let groupBalance = 0;
        // Calculate how much the user owes in this group
        const userDebt = receivables.outstanding_balances
          .filter((balance) => balance.debtor_id === req.user.user_id)
          .reduce((sum, balance) => sum + balance.amount, 0);

        groupBalance += userDebt; // Accumulate across all groups

        // Calculate how much the user owes in this group
        const userCredit = receivables.outstanding_balances
          .filter((balance) => balance.creditor_id === req.user.user_id)
          .reduce((sum, balance) => sum + balance.amount, 0);

        groupBalance -= userCredit; // Accumulate across all groups

        totalBalance += groupBalance;
        return {
          ...group,
          outstanding_balances: receivables.outstanding_balances,
          balance: groupBalance,
        };
      } catch (err) {
        console.error(`Error for group ${group.group_id}:`, err);
        return group; // Return group without receivables on error
      }
    })
  );
}

module.exports = { getCachedItems };
