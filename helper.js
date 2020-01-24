const generateRandomString = function() {
  return Math.random().toString(36).substring(7);
};

const getUserByEmail = function(email, users) {
  let user = null;
  for (const id in users) {
    if (users[id].email === email) {
      user = users[id].id;
    }
  }
  return user;
};

module.exports = { generateRandomString, getUserByEmail };