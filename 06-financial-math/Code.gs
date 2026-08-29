/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 6
 * Financial Math: Loan Calculator
 * 
 * This script calculates loan payments, amortization
 * schedules, and compares loan options.
 * 
 * KEY CONCEPTS:
 * - Compound interest
 * - Loan payments (PMT)
 * - Amortization schedules
 * - ROI and NPV
 * =====================================================
 */

/**
 * =====================================================
 * CORE FINANCIAL FUNCTIONS
 * =====================================================
 */

/**
 * calculateLoanPayment
 * ====================
 * Calculates the monthly payment for a loan.
 * 
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as percentage, e.g., 6 for 6%)
 * @param {number} years - Loan term in years
 * @returns {Object} - Payment details
 */
function calculateLoanPayment(principal, annualRate, years) {
  // Convert annual rate to monthly rate
  var monthlyRate = (annualRate / 100) / 12;
  var totalPayments = years * 12;
  
  // Calculate monthly payment using PMT formula
  var payment;
  if (monthlyRate === 0) {
    payment = principal / totalPayments;
  } else {
    payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
              (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }
  
  // Calculate total cost and total interest
  var totalCost = payment * totalPayments;
  var totalInterest = totalCost - principal;
  
  return {
    principal: principal,
    annualRate: annualRate,
    monthlyRate: monthlyRate * 100, // For display
    years: years,
    totalPayments: totalPayments,
    monthlyPayment: payment,
    totalCost: totalCost,
    totalInterest: totalInterest
  };
}

/**
 * generateAmortizationSchedule
 * ============================
 * Generates a full amortization schedule for a loan.
 * 
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as percentage)
 * @param {number} years - Loan term in years
 * @returns {Array} - Amortization schedule
 */
function generateAmortizationSchedule(principal, annualRate, years) {
  var monthlyRate = (annualRate / 100) / 12;
  var totalPayments = years * 12;
  
  // Get the monthly payment
  var loanDetails = calculateLoanPayment(principal, annualRate, years);
  var payment = loanDetails.monthlyPayment;
  
  var schedule = [];
  var balance = principal;
  
  for (var i = 1; i <= totalPayments; i++) {
    // Calculate interest for this period
    var interestPayment = balance * monthlyRate;
    
    // Calculate principal for this period
    var principalPayment = payment - interestPayment;
    
    // Ensure we don't overpay on the last payment
    if (i === totalPayments) {
      principalPayment = balance;
      interestPayment = payment - principalPayment;
    }
    
    // Update balance
    balance = balance - principalPayment;
    
    // Add to schedule
    schedule.push({
      period: i,
      payment: payment,
      interest: interestPayment,
      principal: principalPayment,
      balance: Math.max(0, balance)
    });
  }
  
  return schedule;
}

/**
 * compareLoans
 * ============
 * Compares two loan options side by side.
 * 
 * @param {Object} loanA - First loan parameters
 * @param {Object} loanB - Second loan parameters
 * @returns {Object} - Comparison results
 */
function compareLoans(loanA, loanB) {
  var detailsA = calculateLoanPayment(loanA.principal, loanA.rate, loanA.years);
  var detailsB = calculateLoanPayment(loanB.principal, loanB.rate, loanB.years);
  
  var savings = detailsA.totalCost - detailsB.totalCost;
  var betterOption = savings > 0 ? 'Loan B' : 'Loan A';
  
  return {
    loanA: {
      name: loanA.name || 'Loan A',
      details: detailsA
    },
    loanB: {
      name: loanB.name || 'Loan B',
      details: detailsB
    },
    comparison: {
      savings: Math.abs(savings),
      betterOption: betterOption,
      monthlySavings: Math.abs(detailsA.monthlyPayment - detailsB.monthlyPayment)
    }
  };
}

/**
 * calculateROI
 * ============
 * Calculates ROI for an investment.
 * 
 * @param {number} initialInvestment - Amount invested
 * @param {number} finalValue - Final value after investment period
 * @returns {Object} - ROI details
 */
function calculateROI(initialInvestment, finalValue) {
  var netProfit = finalValue - initialInvestment;
  var roi = (netProfit / initialInvestment) * 100;
  
  return {
    initialInvestment: initialInvestment,
    finalValue: finalValue,
    netProfit: netProfit,
    roi: roi,
    isProfitable: roi > 0
  };
}

/**
 * calculateNPV
 * ============
 * Calculates Net Present Value of an investment.
 * 
 * @param {number} initialInvestment - Amount invested
 * @param {number[]} cashFlows - Array of cash flows for each period
 * @param {number} discountRate - Discount rate (as percentage)
 * @returns {Object} - NPV details
 */
function calculateNPV(initialInvestment, cashFlows, discountRate) {
  var rate = discountRate / 100;
  var npv = -initialInvestment;
  
  cashFlows.forEach(function(cashFlow, index) {
    var period = index + 1;
    npv += cashFlow / Math.pow(1 + rate, period);
  });
  
  return {
    initialInvestment: initialInvestment,
    cashFlows: cashFlows,
    discountRate: discountRate,
    npv: npv,
    isProfitable: npv > 0
  };
}

/**
 * =====================================================
 * WEB APP FUNCTIONS
 * =====================================================
 */

/**
 * calculateLoanWebApp
 * ===================
 * Calculates loan details for the web app.
 * 
 * @param {number} principal - Loan amount
 * @param {number} rate - Annual interest rate
 * @param {number} years - Loan term in years
 * @param {number} extraPayment - Optional extra monthly payment
 * @returns {Object} - Complete loan details
 */
function calculateLoanWebApp(principal, rate, years, extraPayment) {
  // Calculate basic loan details
  var loanDetails = calculateLoanPayment(principal, rate, years);
  
  // Generate amortization schedule
  var schedule = generateAmortizationSchedule(principal, rate, years);
  
  // Calculate summary statistics
  var totalInterest = loanDetails.totalInterest;
  var interestPercentage = (totalInterest / principal) * 100;
  
  // If extra payment is provided, calculate the savings
  var extraPaymentDetails = null;
  if (extraPayment && extraPayment > 0) {
    var extraSchedule = generateAmortizationScheduleWithExtraPayment(
      principal, rate, years, extraPayment
    );
    var originalMonths = schedule.length;
    var acceleratedMonths = extraSchedule.length;
    var monthsSaved = originalMonths - acceleratedMonths;
    var interestSaved = loanDetails.totalInterest - 
      calculateLoanPayment(principal, rate, acceleratedMonths / 12).totalInterest;
    
    extraPaymentDetails = {
      extraPayment: extraPayment,
      acceleratedMonths: acceleratedMonths,
      monthsSaved: monthsSaved,
      interestSaved: interestSaved,
      schedule: extraSchedule
    };
  }
  
  return {
    loanDetails: loanDetails,
    schedule: schedule,
    summary: {
      totalInterest: totalInterest,
      interestPercentage: interestPercentage,
      totalCost: loanDetails.totalCost
    },
    extraPayment: extraPaymentDetails
  };
}

/**
 * generateAmortizationScheduleWithExtraPayment
 * ===========================================
 * Generates amortization schedule with extra payments.
 */
function generateAmortizationScheduleWithExtraPayment(principal, annualRate, years, extraPayment) {
  var monthlyRate = (annualRate / 100) / 12;
  var totalPayments = years * 12;
  var basePayment = calculateLoanPayment(principal, annualRate, years).monthlyPayment;
  var totalPayment = basePayment + extraPayment;
  
  var schedule = [];
  var balance = principal;
  var period = 0;
  
  while (balance > 0 && period < totalPayments * 2) {
    period++;
    
    // Calculate interest
    var interestPayment = balance * monthlyRate;
    
    // Calculate principal
    var principalPayment = totalPayment - interestPayment;
    
    // Don't overpay
    if (principalPayment > balance) {
      principalPayment = balance;
    }
    
    // Update balance
    balance = balance - principalPayment;
    
    schedule.push({
      period: period,
      payment: totalPayment,
      interest: interestPayment,
      principal: principalPayment,
      balance: Math.max(0, balance)
    });
  }
  
  return schedule;
}

/**
 * getFinancialRecommendations
 * ===========================
 * Provides recommendations based on loan terms.
 */
function getFinancialRecommendations(principal, rate, years) {
  var recommendations = [];
  
  // Recommendation 1: Check if rate is good
  if (rate > 10) {
    recommendations.push('⚠️ Interest rate is above 10%. Consider shopping for a better rate.');
  } else if (rate < 5) {
    recommendations.push('✅ Excellent rate! Consider borrowing more if needed.');
  } else {
    recommendations.push('ℹ️ Current rate is reasonable. Consider fixed vs variable options.');
  }
  
  // Recommendation 2: Check loan term
  if (years > 15) {
    recommendations.push('💡 Long loan term (over 15 years). Consider shorter terms to save interest.');
  } else if (years < 3) {
    recommendations.push('💡 Short loan term (under 3 years). Monthly payments will be higher but total interest lower.');
  }
  
  // Recommendation 3: Extra payment suggestion
  var loanDetails = calculateLoanPayment(principal, rate, years);
  var extraSuggestion = Math.round(loanDetails.monthlyPayment * 0.1);
  recommendations.push('💡 Adding $' + extraSuggestion + ' extra per month could save significant interest.');
  
  return recommendations;
}

// =====================================================
// END OF CODE.GS
// =====================================================
