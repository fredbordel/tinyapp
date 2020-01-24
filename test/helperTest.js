const { assert } = require('chai');

const { getUserByEmail } = require('../helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
    console.log(`User:${user} is the same as expected user:${expectedOutput}`);
  }); it('should return undefined when inexisting email', function() {
    const user = getUserByEmail("whateva@gmail.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
    console.log(`The email you asked for is: ${expectedOutput}`);
  });
});

