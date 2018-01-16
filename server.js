
 //==========================
// Set up
//==========================
var express = require("express");
var app = express();
var path = require('path');
var passport = require("passport")
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var store = require('store')


const OTHER_GENDER = 2
const FEMALE_GENDER = 1
const MALE_GENDER = 0


app.set('port', 3000); // set port
app.use(express.static(__dirname + '/public')); // static files
app.set("view engine", "ejs");

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



//==========================
// Models
//==========================

//==========================
// Routes
//==========================

//These get routes exist to enable the flow of the application. 
app.get('/', function(req, res) {
    res.redirect('/setIsHomeless');
});

app.post('/setIsHomeless', function(req, res){
  res.redirect('/setGender')
  
});

app.post('/setGender', function(req, res){

  let parsedGender = Number(req.body.gender);
  if(parsedGender !== MALE_GENDER){
    //Show the Are you pregnant question only to non-males
    res.redirect('/setIsPregnant')
  }
  else {
    res.redirect('/setIncome')
  }
});

app.post('/setIsPregnant', function(req, res){
  res.redirect('/setIncome');
});

app.post('/setIncome', function(req, res){
  res.redirect('/setHouseholdSize')
});

app.post('/setHouseholdSize', function(req, res){
  res.redirect('/setIsFosterChild')
});

app.post('/setIsFosterChild', function(req, res){
  res.redirect('/setAge')
})

app.post('/setAge', function(req, res){
  res.redirect('/setIsDisabled')
})

app.post('/setIsDisabled', function(req, res){
  res.redirect('/setIsStudent');
})

app.post('/setIsStudent', function(req, res){
  res.redirect('/setHasKids')
})
app.post('/setHasKids', function(req, res){
  res.redirect('/preSubmitPage')
})

app.post('/viewResults', function(req, res){
  // Build the results from the content of the form
  // The form content should be populated by the frontend
  // by pulling data from local storage
  let selectedGender = req.body.selectedGender
  let isPregnant = req.body.isPregnant
  let isFoster = req.body.isFoster
  let isDisabled = req.body.isDisabled
  let isStudent = req.body.isStudent
  let income = req.body.income
  let age = req.body.age
  let householdSize = req.body.householdSize
  let hasKids = req.body.hasKids
  // Create the user info object that will be passed to the benefit
  // eligibilty functions
  let userInfo = {
    income: Number(income),
    age: Number(age),
    wasFosterChild: Boolean(isFoster),
    isPregnant: Boolean(isPregnant),
    isUSCitizen: true,
    householdsize: Number(householdSize),
    selectedGender: Number(selectedGender),
    isStudent: Boolean(isStudent),
    isDisabled: Boolean(isDisabled),
    hasKids: hasKids == "No" || (!hasKids) ? false : true
  }

  let snap = findSnapBenefitsEligibility(userInfo)
  let cash = findCashAssistanceEligibility(userInfo)
  let health = findHealthcareBenefitEligibility(userInfo)

  let results = {
    canGetSnap: snap > 0 ? true : false,
    maxSnapBenefits: getMaxSNAPBenefits(userInfo.householdsize),
    canGetCashAssistance: (cash > 0 )? true : false, 
    maxCashAssistance: getCashBenefitForHouseholdSize(userInfo.householdsize),
    eligibleForHealthcare: health,
    schoolLunch: 'full',
    childCareAssist: false,
    reducedFareBusPass: false, 
    
  }
  
  getAssortedServices(userInfo, results)
  res.render('results', results);
})

//Get routes
// These each render the question based on the object that is passed into the render function
// The question will be equal to fQuestion, and the next page (IE the page the form will be posted to)
// is equal to fValue
app.get('/setIsHomeless', function(req, res){
  let question = "Are you homeless?"

  res.render('yesNoInput', {
    fQuestion: question,
    fAction: "/setIsHomeless",
    fValue: "isHomeless",
  })
});

app.get('/setGender', function(req, res){
  let question = "What is your Gender?"

  res.render('genderInput', {
    fQuestion: question,
    fAction: "/setGender",
    fValue: "gender",
  })
});

app.get('/setIncome', function(req, res){
  let question = "What is your monthly income?"
  
  res.render('textInput', {
    fQuestion: question,
    fAction: "/setIncome",
    fValue: "income",
  })

});

app.get('/setHouseholdSize', function(req, res){
  let question = "How large is your household (Including yourself)?"
  res.render('textInput', {
    fQuestion: question,
    fAction: "/setHouseholdSize",
    fValue: "householdSize",
  })

});

app.get('/setIsPregnant', function(req, res){
  let question = "Are you pregnant?"

  res.render('yesNoInput', {
    fQuestion: question,
    fAction: "/setIsPregnant",
    fValue: "isPregnant",
  })
});

app.get('/setIsFosterChild', function(req, res){
  let question = "Were/Are you a foster child?"

  res.render('yesNoInput', {
    fQuestion: question,
    fAction: "/setIsFosterChild",
    fValue: "isFosterChild",
  })
})

app.get('/setAge', function(req, res){
  let question = "How old are you?"

  res.render('textInput', {
    fQuestion: question,
    fAction: "/setAge",
    fValue: "age"
  })
})

app.get('/setIsDisabled', function(req, res){
  let question = "Are you disabled?"

  res.render('yesNoInput', {
    fQuestion: question,
    fAction: "/setIsDisabled",
    fValue: "isDisabled",
  })
})

app.get('/setIsStudent', function(req, res){
  let question = "Are you a student?"

  res.render('yesNoInput', {
    fQuestion: question,
    fAction: "/setIsStudent",
    fValue: "isStudent",
  })
})

app.get('/setHasKids', function(req, res){
  let question = "Do you have kids?"

  res.render('yesNoInput', {
    fQuestion: question,
    fAction: "/preSubmitPage",
    fValue: "hasKids",
  })
})

app.post('/preSubmitPage', function(req, res){
  res.render('preSubmit')

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
//Start server
//==========================

// Local test server
// app.listen(app.get('port'), function(){
//   console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
// })

// Settings for Google Cloud Platform
const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

   console.log('Example app listening at http://${host}:${port}');
 });


// App functions


function findSnapBenefitsEligibility(visitorInfo){
  let eligibility = 0;
  if(visitorInfo.income < getFederalPovertyLineForHouseholdSize(visitorInfo.householdsize)){
      eligibility = getSNAPBenefits(visitorInfo.householdsize, visitorInfo.income);
  }
  return eligibility;
}

function findCashAssistanceEligibility(visitorInfo){
  //Source: https://des.az.gov/content/cash-assistance-ca-income-eligibility-guidelines
  let cashAssistance = 0;
  if (visitorInfo.income < getFederalPovertyLineForHouseholdSize(visitorInfo.householdsize)){
      cashAssistance = getCashBenefitForHouseholdSize(visitorInfo.householdsize)
  }
  return cashAssistance;

}

function findHealthcareBenefitEligibility(visitorInfo){
  if (checkIfMedicaidEligible(visitorInfo))
        return "medicaid"
    if (checkIfFosterChild(visitorInfo))
        return 'yoAdultTrans'
    if (checkIfExpectingCoverage(visitorInfo))
        return 'aacs-preg'
    if (checkIfQualifiesForAccess(visitorInfo))
        return 'access'
  return 'none';
  }
function checkIfMedicaidEligible(userInfo){
  //Todo: Determine if there are more constraints on medicaid
  if (userInfo.age > 64)
      return true
}
function checkIfFosterChild(visitorInfo){
  return visitorInfo.wasFosterChild && (visitorInfo.age < 26);
}
function checkIfExpectingCoverage(visitorInfo) {
  return visitorInfo.isPregnant && (visitorInfo.income < getFederalPovertyLineForHouseholdSize(visitorInfo.householdsize));
}
function checkIfQualifiesForAccess(visitorInfo){
  //Citation: https://azahcccs.gov/Members/GetCovered/Categories/adults.html
  return (visitorInfo.income < getPovertyLineForHouseholdSize(visitorInfo.householdsize) && visitorInfo.isUSCitizen)
}
function checkIfQualifiesForSNAP(income, householdsize) {
  return income < getFederalPovertyLineForHouseholdSize(householdsize);
}
function getSNAPBenefits(householdsize, income){
  let benefit = 0;
  switch(householdsize) {
      case 1 : benefit = 192
      break;
      case 2 : benefit = 352
      break;
      case 3 : benefit = 504
      break;
      case 4 : benefit = 640 
      break;
      case 5 : benefit = 760 
      break; 
      case 6 : benefit = 913 
      break;
      case 7 : benefit = 1009 
      break;
      case 8 : benefit = 1153 
      break;
      default: 
      benefit = 1153
  }
  return benefit - (income * .3)
}
function getMaxSNAPBenefits(householdsize){
  let benefit = 0;
  switch(householdsize) {
      case 1 : benefit = 192
      break;
      case 2 : benefit = 352
      break;
      case 3 : benefit = 504
      break;
      case 4 : benefit = 640 
      break;
      case 5 : benefit = 760 
      break; 
      case 6 : benefit = 913 
      break;
      case 7 : benefit = 1009 
      break;
      case 8 : benefit = 1153 
      break;
      default: 
      benefit = 1153
  }
  return benefit
}
function getCashBenefitForHouseholdSize(householdsize, getsA1){
  // getsA1 needs to be true or false based on the visitors eligibility
  // for the higher tier of cash benefits. 
  // Source: https://des.az.gov/content/cash-assistance-ca-income-eligibility-guidelines
  let cashBenefit;
  switch(householdsize) {
      case 1 : cashBenefit = getsA1 ? 164 : 103
      break;
      case 2 : cashBenefit = getsA1 ? 220 : 139 
      break;
      case 3 : cashBenefit = getsA1 ? 278 : 175 
      break;
      case 4 : cashBenefit = getsA1 ? 335 : 221
      break;
      case 5 : cashBenefit = getsA1 ? 392 : 247 
      break; 
      case 6 : cashBenefit = getsA1 ? 449 : 238 
      break;
      case 7 : cashBenefit = getsA1 ? 506 : 319
      break;
      case 8 : cashBenefit =  getsA1 ? 563 : 355
      break;
      case 9 : cashBenefit =  getsA1 ? 620 : 391
      break;
      case 10 : cashBenefit =  getsA1 ? 677 : 427
      break;
      case 11 : cashBenefit =  getsA1 ? 734 : 463
      break;
      case 12 : cashBenefit =  getsA1 ? 791 : 499
      break;
      default: 
      cashBenefit =  getsA1 ? 791 : 499
  }
  return cashBenefit;
}
function getFederalPovertyLineForHouseholdSize(householdsize){
  // Source: https://des.az.gov/content/cash-assistance-ca-income-eligibility-guidelines
  let incomeLimit;
  switch(householdsize) {
      case 1 : incomeLimit = 990
      break;
      case 2 : incomeLimit = 1335 
      break;
      case 3 : incomeLimit = 1680 
      break;
      case 4 : incomeLimit = 2025 
      break;
      case 5 : incomeLimit = 2370 
      break; 
      case 6 : incomeLimit = 2715 
      break;
      case 7 : incomeLimit = 3061 
      break;
      case 8 : incomeLimit = 3408 
      break;
      default: 
      incomeLimit = 3408 + ((householdsize - 8) * 3408)
  }
  return incomeLimit;
  
}
function getPovertyLineForHouseholdSize(householdsize){
  let incomeLimit;
  switch(householdsize) {
      case 1 : incomeLimit = 1337
      break;
      case 2 : incomeLimit = 1800 
      break;
      case 3 : incomeLimit = 2264 
      break;
      case 4 : incomeLimit = 2727 
      break;
      case 5 : incomeLimit = 3190 
      break; 
      default: 
      incomeLimit = 3190 + ((householdsize - 5) * 463)
  }
  return incomeLimit;
}

function getAssortedServices(user, object) {
  // Source: http://suntran.com/fares_sungo_options.php
  // Source: https://www.valleymetro.org/reduced-fare-program
  console.log(user)
  if(user.age > 64 || user.age < 18) {
      object.reducedFareBusPass = true
  }
  else {
    object.reducedFareBusPass = false
  }
  // Source: https://www.gpo.gov/fdsys/pkg/FR-2017-04-10/pdf/2017-07043.pdf
  if(user.hasKids && (user.income < ( getFederalPovertyLineForHouseholdSize(user.householdsize) * 1.3) ))
     { object.schoolLunch = 'free' }
  else if(user.hasKids && (user.income < ( getFederalPovertyLineForHouseholdSize(user.householdsize) * 1.3) ))
      { object.schoolLunch = 'reduced '}
  else { object.schoolLunch = 'full'}

  // Source: http://www.arizonachildcare.org/financial-assistance.html

  if (user.hasKids && (user.income < (getFederalPovertyLineForHouseholdSize(user.householdsize) * 1.65))){
    object.childcareAssist = true }
  else {
    object.childCareAssist = false
  }

  
}
