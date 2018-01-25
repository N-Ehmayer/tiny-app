const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const generator = require("./url-generator.js");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");

});

//--- Feeds URLS from database to main index page. ---
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};

  res.render("urls_index", templateVars);
});




app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//--- Feeds URL to URL_show selection page. ---


app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };



  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let randomString = generator();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect("/urls/" + randomString);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  let target = req.params.id;
  delete urlDatabase[target];
  console.log(urlDatabase);

  res.redirect("/urls");
});

//--- Redirects short URLs to full URLs ---
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});