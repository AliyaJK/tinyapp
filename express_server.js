const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");

app.use(cookieSession({
  name: "session",
  keys: ["81vd04rtd"],
}))

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": {
    userID: "6e74hj",
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userID: "3k91nd",
    longURL: "http://www.google.com"
  }
};

const users = {
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
const getUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

//function to return the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id) => {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url].longURL;
    }
  }
  return userURLs;
};

app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!email || !password) {
    return res.status(400).send("Please provide an email and password");
  }

  if (!user) {
    return res.status(403).send("No user with that email found");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password does not match");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Please provide both email and password.");
    return;
  }

  if (getUserByEmail(email, users)) {
    res.status(400).send("Email already exists.");
    return;
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get('/urls', (req, res) => {
  userURLs = urlsForUser(req.session.user_id);
  const templateVars = {
    user: users[req.session.user_id],
    urls: userURLs
  };
  const user = users[req.session.user_id];
  if (!user) {
    res.status(401).send("Please login or register");
    return;
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { user, longURL: "" };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const userURLs = urlsForUser(req.session.user_id);
  if (!user) {
    res.status(401).send("Please login or register");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Short URL not found");
    return;
  }
  if (!userURLs[req.params.id]) {
    res.status(403).send("You do not have permissions for this short URL");
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: userURLs[req.params.id],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send("You need to be logged in to create new URLs.");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: user.id };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  const userURLs = urlsForUser(req.session.user_id);
  if (!user) {
    res.status(401).send("Please login or register");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Short URL not found");
    return;
  }
  if (!userURLs[req.params.id]) {
    res.status(403).send("You do not have permissions for this short URL");
    return;
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  const templateVars = {
    urls: urlDatabase
  };
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const userURLs = urlsForUser(req.session.user_id);
  if (!user) {
    res.status(401).send("Please login or register");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Short URL not found");
    return;
  }
  if (!userURLs[req.params.id]) {
    res.status(403).send("You do not have permissions for this short URL");
    return;
  }
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});