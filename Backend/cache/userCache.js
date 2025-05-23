const userCache = {}; // In-memory storage

function storeUsers(groupId, users) {
    userCache[groupId] = users;
}

function getUsers(groupId) {
  return userCache[groupId] || [];
}

module.exports = { storeUsers, getUsers };
