//__________
// REQUIRES|
//_________|

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
const generateRandomString = function() {
  return Math.random().toString(36).substring(7);
};


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

app.use((req, res, next)=> {
  if (req.cookies["user_id"] && users[req.cookies["user_id"]] === undefined) {
    res.clearCookie("user_id");
    res.redirect("/urls/login");
    return;
  }
  next();
});

// _______
// ROUTES|
// ______|


app.get("/urls/register", (req, res) => {
  const userID = req.cookies["user_id"];
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

  let existingUser;

  for (const userMail in users) {
    if (users[userMail].email === email) {
      existingUser = users[userMail];
    }
  }
  if (existingUser) {
    const userID = req.cookies["user_id"];
    let templateVars = {
      email: userID ? users[userID].email : null,
      error: "Sorry, you have to be more original with that username. Try another one!"
    };
    res.render("urls_register", templateVars);
  } else if (email === "" || password === "") {
    const userID = req.cookies["user_id"];
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
    res.cookie("user_id", randomUserID);
    res.redirect("/urls");
    console.log(newUser);
  }
});


app.get("/urls/login", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = {
    email: userID ? users[userID].email : null,
    error: false
  };
  res.render("urls_login", templateVars);
});

app.post("/urls/login", (req, res) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === req.body.email && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      res.cookie("user_id", id);
      res.redirect("/urls");
    }
  }
  const userID = req.cookies["user_id"];
  let templateVars = {
    email: userID ? users[userID].email : null,
    error: true
  };
  res.render("urls_login", templateVars);
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});



app.get("/urls", (req, res) => {
  const currentUserID = req.cookies["user_id"];

  let urlsForUserID = {};
  for (let key in urlDatabase) {
    if (currentUserID === urlDatabase[key]['userID']) {
      urlsForUserID[key] = urlDatabase[key];
    }
  }
  const userID = req.cookies["user_id"];
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
  const userID = req.cookies["user_id"];
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
  const userID = req.cookies["user_id"];
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
  urlDatabase[randomURL] = {longURL : req.body.longURL, userID : req.cookies["user_id"]};
  res.redirect(`/urls/${randomURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// ________________________________
// DON'T KNOW WHAT TO DO WITH THIS|
// _______________________________|

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// _______
// LISTEN|
// ______|

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




