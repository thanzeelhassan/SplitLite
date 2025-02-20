const expenseParticipantCache = {}; // In-memory storage

function storeExpenseParticipants(groupId, expenseParticipants) {
  expenseParticipantCache[groupId] = expenseParticipants;
}

function getExpenseParticipants(groupId) {
  return expenseParticipantCache[groupId] || [];
}

module.exports = { storeExpenseParticipants, getExpenseParticipants };
