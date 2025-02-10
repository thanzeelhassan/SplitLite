const expenseParticipantCache = {}; // In-memory storage

function storeExpenseParticipants(groupId, expenseParticipants) {
  expenseParticipantCache[groupId] = expenseParticipants;
}

function getExpenseParticipantCache(groupId) {
  return expenseParticipantCache[groupId] || [];
}

module.exports = { storeExpenseParticipants, getExpenseParticipantCache };
