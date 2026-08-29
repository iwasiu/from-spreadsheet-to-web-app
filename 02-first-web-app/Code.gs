/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 2
 * Backend: Google Apps Script
 * 
 * This file contains the backend logic for the
 * Sales Analyzer Web App.
 * 
 * To use: Copy this entire file into your Apps Script
 * project's Code.gs file.
 * =====================================================
 */

/**
 * analyzeSalesWebApp
 * ==================
 * This function is called from the HTML frontend via google.script.run.
 * It takes an array of numbers and returns a summary object.
 * 
 * @param {number[]} numbers - An array of sales figures
 * @returns {Object} - Summary containing total, average, stdDev, and outliers
 * 
 * @example
 * // Input: [1200, 1450, 980, 2100, 450]
 * // Output: { total: 6180, average: 1236, stdDev: 610.8, outliers: [2100, 450] }
 */
function analyzeSalesWebApp(numbers) {
  /*
    =====================================================
    STEP 1: VALIDATE INPUT
    =====================================================
    We check that we have valid data before processing.
    If the input is invalid, we throw an error that will
    be caught by the failure handler in the frontend.
  */
  if (!numbers || numbers.length === 0) {
    throw new Error('No valid numbers provided. Please enter at least one number.');
  }
  
  // Remove any non-numeric values just in case
  var validNumbers = numbers.filter(function(num) {
    return typeof num === 'number' && !isNaN(num);
  });
  
  if (validNumbers.length === 0) {
    throw new Error('No valid numbers found. Please enter numeric values only.');
  }
  
  /*
    =====================================================
    STEP 2: CALCULATE TOTAL (SUMMATION)
    =====================================================
    The reduce() method loops through each number and
    adds it to a running total. This is the arithmetic
    operation of SUMMATION.
  */
  var total = validNumbers.reduce(function(sum, num) {
    return sum + num;
  }, 0);
  
  /*
    =====================================================
    STEP 3: CALCULATE AVERAGE (MEAN)
    =====================================================
    The average is the total divided by the count of numbers.
    This is the arithmetic operation of DIVISION.
  */
  var average = total / validNumbers.length;
  
  /*
    =====================================================
    STEP 4: CALCULATE STANDARD DEVIATION
    =====================================================
    Standard deviation measures how spread out the numbers are.
    
    Formula: sqrt( sum((x - mean)^2) / n )
    
    We do this in three sub-steps:
    4a: Calculate squared differences from the mean
    4b: Calculate the variance (average of squared differences)
    4c: Take the square root to get standard deviation
  */
  var squaredDiffs = validNumbers.map(function(num) {
    return Math.pow(num - average, 2);
  });
  
  var variance = squaredDiffs.reduce(function(sum, val) {
    return sum + val;
  }, 0) / validNumbers.length;
  
  var stdDev = Math.sqrt(variance);
  
  /*
    =====================================================
    STEP 5: FLAG OUTLIERS
    =====================================================
    An outlier is a value more than 2 standard deviations
    away from the mean. This is a common statistical
    threshold used in business analysis.
    
    Formula: |value - mean| > 2 * standardDeviation
  */
  var outliers = validNumbers.filter(function(num) {
    return Math.abs(num - average) > 2 * stdDev;
  });
  
  /*
    =====================================================
    STEP 6: RETURN THE SUMMARY
    =====================================================
    We return a clean object with named properties.
    This makes it easy for the frontend to display the data.
  */
  return {
    total: total,
    average: average,
    stdDev: stdDev,
    outliers: outliers.length > 0 ? outliers : [],
    count: validNumbers.length
  };
}

// =====================================================
// END OF CODE.GS
// =====================================================
