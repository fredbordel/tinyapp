//__________
// REQUIRES|
//_________|


const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserByEmail } = require("./helper");



// ______
// DATA |
// _____|



const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10)
  }
};


/// __________
/// MIDDLEWARE|
/// __________|


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: "session",
  keys: ["banana", "aragorn", "moria", "soft", "superduper"]
}));

// Middleware that clear old cookies when restarting the server
app.use((req, res, next)=> {
  if (req.session.user_id && users[req.session.user_id] === undefined) {
    req.session = null;
    res.redirect("/urls/login");
    return;
  }
  next();
});


// _______
// ROUTES|
// ______|


// ________________
// USER MANAGEMENT|
// _______________|



app.get("/urls/register", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = {
    email: userID ? users[userID].email : null,
    error: false
  };
  res.render("urls_register", templateVars);
});


app.post("/urls/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //Checking registering request from user and validating their identity
  let existingUser = getUserByEmail(email, users);
  if (existingUser) {
    const userID = req.session.user_id;
    let templateVars = {
      email: userID ? users[userID].email : null,
      error: "Sorry, you have to be more original with that username. Try another one!"
    };
    res.render("urls_register", templateVars);
  } else if (email === "" || password === "") {
    const userID = req.session.user_id;
    let templateVars = {
      email: userID ? users[userID].email : null,
      error: "You forgot something here..."
    };
    res.render("urls_register", templateVars);
  } else {
    let randomUserID = generateRandomString();
    let newUser = {
      id: randomUserID,
      email: email,
      password: password,
      hashedPassword: hashedPassword
    };
    users[newUser.id] = newUser;
    req.session.user_id = randomUserID;
    res.redirect("/urls");
  }
});


app.get("/urls/login", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = {
    email: userID ? users[userID].email : null,
    error: false
  };
  res.render("urls_login", templateVars);
});


app.post("/urls/login", (req, res) => {
  for (const id in users) {
    let user = users[id];
    //Checking login request from user and validating their identity
    if (user.email === req.body.email && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      req.session.user_id = id;
      res.redirect("/urls");
    }
  }
  const userID = req.session.user_id;
  let templateVars = {
    email: userID ? users[userID].email : null,
    error: true
  };
  res.render("urls_login", templateVars);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  const currentUserID = req.session.user_id;
  let urlsForUserID = {};
  for (let key in urlDatabase) {
    if (currentUserID === urlDatabase[key]['userID']) {
      urlsForUserID[key] = urlDatabase[key];
    }
  }
  const userID = req.session.user_id;
  let templateVars = {
    urls: urlsForUserID,
    email: userID ? users[userID].email : null
  };
  res.render("urls_index", templateVars);
});


// _______________
// URL MANAGEMENT|
//_______________|



app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = {
    email: userID ? users[userID].email : null,
  };
  if (userID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = {
    email: userID ? users[userID].email : null,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  if (!userID) {
    res.redirect("/urls");
  }
  res.render("urls_show", templateVars);
});


app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = {longURL : req.body.longURL, userID : req.session.user_id};
  res.redirect(`/urls/${randomURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// _______
// LISTEN|
// ______|



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




