const groupMembersCache = {}; // In-memory storage

function storeGroupMembers(groupId, groupMembers) {
    groupMembersCache[groupId] = groupMembers;
}

function getGroupMembers(groupId) {
  return groupMembersCache[groupId] || [];
}

module.exports =  { storeGroupMembers, getGroupMembers };
