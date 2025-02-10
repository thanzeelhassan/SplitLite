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

async function calculate(groupId) {
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

module.exports = { calculate };
