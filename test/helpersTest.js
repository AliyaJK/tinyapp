const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
    "6e74hj": {
      id: "6e74hj",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    },
    "3k91nd": {
      id: "3k91nd",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
  };

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "6e74hj";
    const expectedEmail = "user@example.com";
    assert.strictEqual(user.id, expectedUserID);
    assert.strictEqual(user.email, expectedEmail);
  });

  it("should return undefined when a non-existent email is given", () => {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedResult = undefined;
    assert.strictEqual(user, expectedResult);
  });
});