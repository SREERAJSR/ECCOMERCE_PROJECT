require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const ejs = require("ejs");
const session = require('express-session')
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

var app = express();

// Configure the cookie-parser middleware
app.use(cookieParser());

//session store

app.use(session({
  secret:"key",
  resave:false,
  saveUninitialized:true,
  cookie: { maxAge: 600000 } 
}))

var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");

app.use(expressLayouts);



// Database connection

mongoose
  .connect("mongodb://localhost:27017/Laphub")
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("error in database connectino" + err);
  });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("layout", "layouts/layout"); // Set the layout file
// Set the partials directory
app.set("view options", { partials: path.join(__dirname, "views/partials") });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRouter);
app.use("/", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
