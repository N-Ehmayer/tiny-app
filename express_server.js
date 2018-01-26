const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const generator = require("./url-generator.js");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

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
  if (isMatch(req.body.email, users, "email") && isMatch(req.body.password, users, "password")) {
    res.cookie("userData", users[id]);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.redirect("/login");
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie("userData");

  res.redirect("/urls");
});

app.get("/register", (req, res) => {

res.render("register");
});

app.post("/register", (req, res) => {
  let randomId = generator();
  users[randomId] = {};
  users[randomId].id = randomId;
  users[randomId].email = req.body.email;
  users[randomId].password = req.body.password;
  // if (isNameMatch(req.body.email, users)) {    // Fix these error throws..
  //   throw err;
  // } else if (req.body.email) {
  //   throw err
  // } else {
  res.cookie("userData", users[randomId]);
  res.redirect("/urls");
  //}


});

//--- Feeds URLS from database to main index page. ---
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userData: req.cookies.userData
  };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    userData: req.cookies.userData
  };

  res.render("urls_new", templateVars);
});


//--- Feeds URL to URL_show selection page. ---
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    userData: req.cookies.userData
  };
  console.log(req.params.id);

  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  console.log(urlDatabase[req.params.id].url);
  urlDatabase[req.params.id].url = req.body.longURL;

  res.redirect("/urls");
});



app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let randomString = generator();
  urlDatabase[randomString] = {};
  urlDatabase[randomString].url = req.body.longURL;

  res.redirect("/urls"); //res.redirect("/urls/" + randomString);
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});


//--- Redirects short URLs to full URLs ---
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});