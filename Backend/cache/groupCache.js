const groupsCache = {}; // In-memory storage

function storeGroups(userId, groups) {
    groupsCache[userId] = groups;
}

function getGroups(userId) {
  return groupsCache[userId] || [];
}

export default { storeGroups, getGroups };
