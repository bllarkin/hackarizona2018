//==========================
// Set up
//==========================
var express = require("express");
var app = express();
var path = require('path');
var passport = require("passport")
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");


app.set('port', 3000); // set port
app.use(express.static(__dirname + '/public')); // static files
app.set("view engine", "ejs");

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost/socialservices");


//==========================
// Models
//==========================

//==========================
// Routes
//==========================
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
 
app.post('/setGender', function(req, res){
  let question = "What is your Gender?"
  if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }
  let parsedGender = String(req.body.gender);
  localStorage.setItem('gender', parsedGender);
  console.log(localStorage.getItem('gender'));
  res.send()
});

app.post('/setIncome', function(req, res){
  let question = "What is your monthly income?"

  let income = Number(req.body.income);
  localStorage.setItem('income', income);
  console.log(localStorage.getItem('income'));

  res.send()
});

app.post('/setHouseholdSize', function(req, res){
  let question = "How large is your household (Including yourself)?"

  let householdIncome = Number(req.body.householdIncome);
  localStorage.setItem('householdIncome', householdIncome);
  console.log(localStorage.getItem('householdIncome'));

  res.send()
});

app.post('/setIsPregnant', function(req, res){
  let question = "Are you pregnant?"

  let isPregnant = String(req.body.isPregnant);
  localStorage.setItem('isPregnant', isPregnant);
  console.log(localStorage.getItem('isPregnant'));

  res.send()
});

app.post('/setIsFosterChild', function(req, res){
  let question = "Were/Are you a foster child?"

  let isFoster = String(req.body.isFoster);
  localStorage.setItem('isFoster', isFoster);
  console.log(localStorage.getItem('isFoster'));

  res.send()
})

app.post('/setAge', function(req, res){
  let question = "How old are you?"

  let age = Number(req.body.age);
  localStorage.setItem('age', age);
  console.log(localStorage.getItem('age'));

  res.send()
})

app.post('/setIsDisabled', function(req, res){
  let question = "Are you disabled?"

  let isDisabled = String(req.body.isDisabled);
  localStorisDisabled.setItem('isDisabled', isDisabled);
  console.log(localStorisDisabled.getItem('isDisabled'));

  res.send()
})

app.post('/setIsStudent', function(req, res){
  let question = "Are you a student?"

  let isStudent = String(req.body.isStudent);
  localStorisStudent.setItem('isStudent', isStudent);
  console.log(localStorisStudent.getItem('isStudent'));


  res.send()
})


//==========================
// Error Handling routes
//==========================
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

//==========================
// Start server
//==========================
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});