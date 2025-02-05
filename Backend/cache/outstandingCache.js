const outstandingCache = {}; // In-memory storage

function storeOutstandings(groupId, outstanding) {
  outstandingCache[groupId] = outstanding;
}

function getOutstandings(groupId) {
  return outstandingCache[groupId] || [];
}

export default { storeOutstandings, getOutstandings };
