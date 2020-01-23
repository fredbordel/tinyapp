// REQUIRES|
//_________|

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
const generateRandomString = function() {
  return Math.random().toString(36).substring(7);
};


// DATA |
// _____|

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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
      password: password
    };
    users[newUser.id] = newUser;
    res.cookie("user_id", randomUserID);
    res.redirect("/urls");
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
  for (const userMail in users) {
    if (users[userMail].email === req.body.email && users[userMail].password === req.body.password) {
      res.cookie("user_id", userMail);
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
  const userID = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase,
    email: userID ? users[userID].email : null
  };
  res.render("urls_index", templateVars);
});


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
  res.render("urls_new", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = {
    email: userID ? users[userID].email : null,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:shortURL", (req, res) => {
  let updatedURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = updatedURL;
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase.randomURL = req.body.longURL;
  res.redirect(`/urls/:${randomURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase.randomURL;
  res.redirect(longURL);
});








// DON'T KNOW WHAT TO DO WITH THIS|
// _______________________________|

app.get("/", (req, res) => {
  res.send('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// LISTEN|
// ______|

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




