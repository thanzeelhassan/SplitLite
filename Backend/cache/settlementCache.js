const settlementsCache = {}; // In-memory storage

function storeSettlements(groupId, settlements) {
  settlementsCache[groupId] = settlements;
}

function getSettlements(groupId) {
  return settlementsCache[groupId] || [];
}

export default { storeSettlements, getSettlements };
