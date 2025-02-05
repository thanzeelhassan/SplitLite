const sql = require("../config/database");
const { getSettlements } = require("../cache/settlementCache");

async function calculateOutstanding(group_id) {
  const settlements = getSettlements(groupId);

  return { settlements: settlements };
}

module.exports = { calculateOutstanding };
