const expensesCache = {}; // In-memory storage

function storeExpenses(groupId, expenses) {
    expensesCache[groupId] = expenses;
}

function getExpenses(groupId) {
  return expensesCache[groupId] || [];
}

export default { storeExpenses, getExpenses };
