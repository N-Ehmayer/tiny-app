const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const generator = require("./url-generator.js");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

var urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: ""
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: ""
  }
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
}

function urlsForUser(id) {
  const matchList = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      matchList[key] = urlDatabase[key];
    }
  }
  return matchList;
}

function isMatch(userEntry, userListOdject, infoType) {
  for (let key in userListOdject) {
    if (userListOdject[key][infoType] === userEntry) {
      return true;
    }
  }
  return false;
}

function getUserId(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key].id;
    }
  }
}


app.get("/", (req, res) => {
  res.end("Hello!");

});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let id = getUserId(req.body.email);

  if (isMatch(req.body.email, users, "email") && bcrypt.compareSync(req.body.password, users[id].password))   {
    //res.cookie("userData", users[id]);
    req.session.user_id = users[id];
    res.redirect("/urls");
  } else {
    res.status(403);
    res.redirect("/login");
  }

});

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/urls");
});

app.get("/register", (req, res) => {

res.render("register");
});

app.post("/register", (req, res) => {
  let randomId = generator();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[randomId] = {};
  users[randomId].id = randomId;
  users[randomId].email = req.body.email;
  users[randomId].password = hashedPassword;
  console.log(users[randomId]);
  // if (isNameMatch(req.body.email, users)) {    // Fix these error throws..
  //   throw err;
  // } else if (req.body.email) {
  //   throw err
  // } else {
  req.session.user_id = users[randomId];
  res.redirect("/urls");
  //}


});

//--- Feeds URLS from database to main index page. ---
app.get("/urls", (req, res) => {
  if(req.session.user_id) {
    let templateVars = {
      urls: urlsForUser(req.session.user_id.id),
      userUrls: urlsForUser(req.session.user_id.id),
      userData: req.session.user_id
    }
    res.render("urls_index", templateVars);
  }
  else {
    let templateVars = {
      urls: urlDatabase.userID,
      userData: false
    }
  res.render("urls_index", templateVars);
  }
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    userData: req.session.user_id
    //userData: req.cookies.userData
  };

  res.render("urls_new", templateVars);
});


//--- Feeds URL to URL_show selection page. ---
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    userData: req.session.user_id
  };

  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].url = req.body.longURL;

  res.redirect("/urls");
});



app.post("/urls", (req, res) => {
  let randomString = generator();
  urlDatabase[randomString] = {};
  urlDatabase[randomString].url = req.body.longURL;
  urlDatabase[randomString].userID = req.session.user_id.id;
  //urlDatabase[randomString].userID = req.cookies.userData.id;

  res.redirect("/urls"); //res.redirect("/urls/" + randomString);
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});


//--- Redirects short URLs to full URLs ---
app.get("/u/:shortURL", (req, res) => {
  console.log("got correct route")
  console.log(urlDatabase);
  console.log(req.params);
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});