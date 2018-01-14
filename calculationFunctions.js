function createLocalStorageIfItDoesntExist(){
    if (typeof localStorage === "undefined" || localStorage === null) {
      var LocalStorage = require('node-localstorage').LocalStorage;
      localStorage = new LocalStorage('./scratch');
    }
  }
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
      console.log("alright do we even get here ")
        cashAssistance = getCashBenefitForHouseholdSize(visitorInfo.householdsize)
    }
    return cashAssistance;
  
  }
  
  function findHealthcareBenefitEligibility(visitorInfo){
    if (checkIfMedicaidEligible(visitorInfo))
          return "medicaid"
      if (checkIfFosterChild(visitorInfo))
          return 'yoAdultTrans'
      if (checkIfExpecting(visitorInfo))
          return 'aacs-preg'
      if (checkIfQualifiesForAccess(visitorInfo))
          return 'access'
    return 'none';
    }
  function checkIfMedicaidEligible(userInfo){
    if (userInfo.age > 64)
        return true
  }
  function checkIfFosterChild(visitorInfo){
    return visitorInfo.wasFosterChild;
  }
  function checkIfExpecting(visitorInfo) {
    return visitorInfo.isPregnant;
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
  function getMaxSNAPBenefits(householdsize, income){
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
    if(user.age > 64 || user.age < 18) ){
        object.reducedFareBusPass = true
    }
    // Source: https://www.gpo.gov/fdsys/pkg/FR-2017-04-10/pdf/2017-07043.pdf
    if(user.hasKids && (user.income < ( getFederalPovertyLineForHouseholdSize(user.householdsize) * 1.3) ))
       { object.schoolLunch = 'free' }
    else if(user.hasKids && (user.income < ( getFederalPovertyLineForHouseholdSize(user.householdsize) * 1.3) ))
        { object.schoolLunch = 'reduced '}
    else { object.schoolLunch = 'full'}

    
}
