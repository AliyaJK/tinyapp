//function to return random 6-char string
const generateRandomString = () => {
  const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

//function to find user in database
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return;
};

//function to return the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id, database) => {
  const userURLs = {};
  for (const url in database) {
    if (database[url].userID === id) {
      userURLs[url] = database[url].longURL;
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};