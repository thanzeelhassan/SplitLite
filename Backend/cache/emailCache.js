const emailCache = {};

function storeEmails(email, details) {
    emailCache[email] = details;
}

function getEmails(email) {
  return emailCache[email] || [];
}

module.exports = { storeEmails, getEmails };
