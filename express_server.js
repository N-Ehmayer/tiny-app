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
}



app.get("/", (req, res) => {
  res.end("Hello!");

});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");

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
  res.cookie("userData", users[randomId]);
  console.log(users);

  res.redirect("/urls");
})

//--- Feeds URLS from database to main index page. ---
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.username,
    userdata: req.cookies.userData
  };

  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };

  res.render("urls_new", templateVars);
});


//--- Feeds URL to URL_show selection page. ---
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
  };

  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  console.log(req.params);
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});



app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let randomString = generator();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect("/urls/" + randomString);
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