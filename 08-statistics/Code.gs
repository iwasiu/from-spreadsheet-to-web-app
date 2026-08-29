/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 8
 * Customer Satisfaction Analyzer
 * 
 * This script analyzes customer satisfaction data
 * using statistical methods.
 * 
 * KEY CONCEPTS:
 * - Mean, Median, Mode
 * - Variance and Standard Deviation
 * - Z-Scores and Outliers
 * - Percentiles and Confidence Intervals
 * =====================================================
 */

/**
 * =====================================================
 * STATISTICAL FUNCTIONS
 * =====================================================
 */

/**
 * calculateMean
 * =============
 * Calculates the mean (average) of an array of numbers.
 * 
 * @param {number[]} data - Array of numbers
 * @returns {number} - Mean
 */
function calculateMean(data) {
  if (data.length === 0) return 0;
  var sum = data.reduce(function(a, b) { return a + b; }, 0);
  return sum / data.length;
}

/**
 * calculateMedian
 * ===============
 * Calculates the median of an array of numbers.
 * 
 * @param {number[]} data - Array of numbers
 * @returns {number} - Median
 */
function calculateMedian(data) {
  if (data.length === 0) return 0;
  var sorted = data.slice().sort(function(a, b) { return a - b; });
  var mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * calculateMode
 * =============
 * Calculates the mode(s) of an array of numbers.
 * 
 * @param {number[]} data - Array of numbers
 * @returns {Array} - Array of modes
 */
function calculateMode(data) {
  if (data.length === 0) return [];
  
  var frequency = {};
  data.forEach(function(value) {
    frequency[value] = (frequency[value] || 0) + 1;
  });
  
  var maxFreq = 0;
  var modes = [];
  
  for (var key in frequency) {
    if (frequency[key] > maxFreq) {
      maxFreq = frequency[key];
      modes = [parseFloat(key)];
    } else if (frequency[key] === maxFreq) {
      modes.push(parseFloat(key));
    }
  }
  
  return modes;
}

/**
 * calculateVariance
 * =================
 * Calculates the variance of an array of numbers.
 * 
 * @param {number[]} data - Array of numbers
 * @param {number} mean - Pre-calculated mean (optional)
 * @returns {number} - Variance
 */
function calculateVariance(data, mean) {
  if (data.length === 0) return 0;
  var m = mean || calculateMean(data);
  var squaredDiffs = data.map(function(x) {
    return Math.pow(x - m, 2);
  });
  return squaredDiffs.reduce(function(a, b) { return a + b; }, 0) / data.length;
}

/**
 * calculateStdDev
 * ===============
 * Calculates the standard deviation of an array of numbers.
 * 
 * @param {number[]} data - Array of numbers
 * @param {number} variance - Pre-calculated variance (optional)
 * @returns {number} - Standard deviation
 */
function calculateStdDev(data, variance) {
  if (data.length === 0) return 0;
  var v = variance || calculateVariance(data);
  return Math.sqrt(v);
}

/**
 * calculateZScore
 * ===============
 * Calculates the Z-score for a value.
 * 
 * @param {number} value - The value to evaluate
 * @param {number} mean - The mean of the dataset
 * @param {number} stdDev - The standard deviation of the dataset
 * @returns {number} - Z-score
 */
function calculateZScore(value, mean, stdDev) {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * calculatePercentile
 * ===================
 * Calculates the percentile of a value in a dataset.
 * 
 * @param {number[]} data - Array of numbers (sorted)
 * @param {number} value - The value to find the percentile for
 * @returns {number} - Percentile (0-100)
 */
function calculatePercentile(data, value) {
  if (data.length === 0) return 0;
  var sorted = data.slice().sort(function(a, b) { return a - b; });
  var below = sorted.filter(function(x) { return x < value; }).length;
  var equal = sorted.filter(function(x) { return x === value; }).length;
  return ((below + equal / 2) / sorted.length) * 100;
}

/**
 * calculateConfidenceInterval
 * ===========================
 * Calculates a confidence interval for the mean.
 * 
 * @param {number[]} data - Array of numbers
 * @param {number} confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns {Object} - Confidence interval
 */
function calculateConfidenceInterval(data, confidenceLevel) {
  if (data.length === 0) return { lower: 0, upper: 0 };
  
  var mean = calculateMean(data);
  var stdDev = calculateStdDev(data);
  var n = data.length;
  
  // Z-score for confidence level
  var zScore = 1.96; // 95% confidence (simplified)
  if (confidenceLevel === 0.99) zScore = 2.576;
  if (confidenceLevel === 0.90) zScore = 1.645;
  
  var marginOfError = zScore * (stdDev / Math.sqrt(n));
  
  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    mean: mean,
    marginOfError: marginOfError
  };
}

/**
 * identifyOutliers
 * ================
 * Identifies outliers using the Z-score method.
 * 
 * @param {number[]} data - Array of numbers
 * @param {number} threshold - Z-score threshold (default: 2)
 * @returns {Object} - Outlier analysis
 */
function identifyOutliers(data, threshold) {
  if (data.length === 0) return { outliers: [], indices: [] };
  
  var mean = calculateMean(data);
  var stdDev = calculateStdDev(data);
  var thresholdZ = threshold || 2;
  
  var outliers = [];
  var indices = [];
  
  data.forEach(function(value, index) {
    var zScore = calculateZScore(value, mean, stdDev);
    if (Math.abs(zScore) > thresholdZ) {
      outliers.push(value);
      indices.push(index);
    }
  });
  
  return {
    outliers: outliers,
    indices: indices,
    count: outliers.length,
    percentage: (outliers.length / data.length) * 100
  };
}

/**
 * =====================================================
 * SATISFACTION ANALYSIS FUNCTIONS
 * =====================================================
 */

/**
 * getSatisfactionData
 * ===================
 * Reads satisfaction data from the active sheet.
 * 
 * @returns {Object} - Satisfaction data
 */
function getSatisfactionData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Remove header row
  var headers = data.shift();
  
  var scores = [];
  var rawData = [];
  
  data.forEach(function(row) {
    if (row[2] && !isNaN(parseFloat(row[2]))) {
      var score = parseFloat(row[2]);
      scores.push(score);
      rawData.push({
        customerId: row[0] || '',
        date: row[1] || '',
        score: score,
        comment: row[3] || ''
      });
    }
  });
  
  return {
    scores: scores,
    rawData: rawData,
    count: scores.length
  };
}

/**
 * analyzeSatisfaction
 * ===================
 * Performs comprehensive statistical analysis.
 * 
 * @returns {Object} - Complete analysis results
 */
function analyzeSatisfaction() {
  var data = getSatisfactionData();
  
  if (data.scores.length === 0) {
    return {
      success: false,
      error: 'No data found. Please add satisfaction scores to the sheet.'
    };
  }
  
  var scores = data.scores;
  var count = scores.length;
  
  // Central tendency
  var mean = calculateMean(scores);
  var median = calculateMedian(scores);
  var modes = calculateMode(scores);
  
  // Dispersion
  var variance = calculateVariance(scores, mean);
  var stdDev = calculateStdDev(scores, variance);
  var range = Math.max.apply(null, scores) - Math.min.apply(null, scores);
  
  // Distribution
  var distribution = {};
  scores.forEach(function(score) {
    distribution[score] = (distribution[score] || 0) + 1;
  });
  
  // Percentiles
  var sorted = scores.slice().sort(function(a, b) { return a - b; });
  var p25 = sorted[Math.floor(count * 0.25)];
  var p50 = sorted[Math.floor(count * 0.50)];
  var p75 = sorted[Math.floor(count * 0.75)];
  var p90 = sorted[Math.floor(count * 0.90)];
  var p95 = sorted[Math.floor(count * 0.95)];
  
  // Outliers
  var outlierAnalysis = identifyOutliers(scores, 2);
  
  // Confidence interval (95%)
  var ci = calculateConfidenceInterval(scores, 0.95);
  
  // Z-scores for each value
  var zScores = scores.map(function(score) {
    return {
      value: score,
      zScore: calculateZScore(score, mean, stdDev)
    };
  });
  
  // Count by category
  var excellent = scores.filter(function(s) { return s >= 4.5; }).length;
  var good = scores.filter(function(s) { return s >= 3.5 && s < 4.5; }).length;
  var average = scores.filter(function(s) { return s >= 2.5 && s < 3.5; }).length;
  var poor = scores.filter(function(s) { return s >= 1.5 && s < 2.5; }).length;
  var terrible = scores.filter(function(s) { return s < 1.5; }).length;
  
  return {
    success: true,
    count: count,
    centralTendency: {
      mean: mean,
      median: median,
      modes: modes,
      meanRounded: mean.toFixed(2),
      medianRounded: median.toFixed(2)
    },
    dispersion: {
      variance: variance,
      stdDev: stdDev,
      range: range,
      stdDevRounded: stdDev.toFixed(2),
      varianceRounded: variance.toFixed(2)
    },
    distribution: distribution,
    percentiles: {
      p25: p25,
      p50: p50,
      p75: p75,
      p90: p90,
      p95: p95
    },
    outliers: outlierAnalysis,
    confidenceInterval: {
      lower: ci.lower,
      upper: ci.upper,
      mean: ci.mean,
      marginOfError: ci.marginOfError,
      lowerRounded: ci.lower.toFixed(2),
      upperRounded: ci.upper.toFixed(2)
    },
    zScores: zScores,
    categories: {
      excellent: excellent,
      good: good,
      average: average,
      poor: poor,
      terrible: terrible,
      excellentPercent: (excellent / count * 100).toFixed(1),
      goodPercent: (good / count * 100).toFixed(1),
      averagePercent: (average / count * 100).toFixed(1),
      poorPercent: (poor / count * 100).toFixed(1),
      terriblePercent: (terrible / count * 100).toFixed(1)
    },
    rawData: data.rawData
  };
}

/**
 * =====================================================
 * WEB APP FUNCTIONS
 * =====================================================
 */

/**
 * getAnalysisWebApp
 * =================
 * Returns analysis data for the web app.
 * 
 * @returns {Object} - Analysis results
 */
function getAnalysisWebApp() {
  return analyzeSatisfaction();
}

/**
 * getTopCommentsWebApp
 * ====================
 * Returns comments from the most satisfied and least satisfied customers.
 * 
 * @param {number} n - Number of comments to return
 * @returns {Object} - Top and bottom comments
 */
function getTopCommentsWebApp(n) {
  var data = getSatisfactionData();
  var rawData = data.rawData;
  var nVal = n || 5;
  
  // Sort by score
  var sorted = rawData.slice().sort(function(a, b) {
    return b.score - a.score;
  });
  
  var top = sorted.slice(0, nVal);
  var bottom = sorted.slice(Math.max(sorted.length - nVal, 0));
  bottom.reverse();
  
  return {
    top: top,
    bottom: bottom
  };
}

/**
 * addSampleSatisfactionData
 * =========================
 * Adds sample satisfaction data to the sheet.
 */
function addSampleSatisfactionData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  
  // Check if data exists
  var existingData = sheet.getDataRange().getValues();
  if (existingData.length > 1) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert('⚠️ Warning', 'This will overwrite existing data. Continue?', ui.ButtonSet.YES_NO);
    if (response !== ui.Button.YES) {
      return;
    }
  }
  
  sheet.clear();
  
  // Add headers
  var headers = ['Customer ID', 'Date', 'Satisfaction Score', 'Comment'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Generate sample data
  var sampleData = [];
  var scores = [5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 2, 2, 1, 5, 5, 4, 4, 4, 3, 5, 5, 4, 4, 5, 3, 4, 5, 5, 4, 3, 2, 5, 4, 5, 4, 5, 4, 4, 3, 5, 5, 5, 4, 4, 2, 3, 5, 4, 5, 4, 5, 5, 4, 4, 5, 5, 4, 4, 5, 5, 4, 3, 5, 4, 5, 4, 5, 4, 5, 5, 4, 4, 5, 5, 4, 5, 4, 5, 4, 4, 3, 5, 5, 4, 4, 5, 4, 5, 4, 5, 5, 4, 5, 5, 4, 4, 5, 4, 5, 5];
  
  var comments = [
    'Excellent service! Very satisfied.',
    'Good, but wait time was a bit long.',
    'Product arrived damaged. Disappointed.',
    'Very happy with my purchase.',
    'Average experience, nothing special.',
    'The team was incredibly helpful!',
    'Shipping was faster than expected.',
    'Great quality, will buy again.',
    'Customer service resolved my issue quickly.',
    'Decent product, but overpriced.',
    'Terrible experience. Will not return.',
    'Everything was perfect!',
    'Good value for the price.',
    'Had a small issue but it was resolved.',
    'Amazing! Highly recommend.',
    'Satisfied overall.',
    'The quality exceeded my expectations.',
    'Customer service was rude.',
    'Great product!',
    'Will definitely recommend to friends.',
    'Good experience overall.',
    'The packaging was damaged.',
    'Excellent quality and service.',
    'Could have been better.',
    'Very professional team.',
    'Loved the product!',
    'The delivery was on time.',
    'Great customer support.',
    'Satisfied with the purchase.',
    'Needs improvement.'
  ];
  
  var startDate = new Date(2024, 0, 1);
  
  for (var i = 0; i < scores.length; i++) {
    var date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 180));
    
    var commentIndex = Math.floor(Math.random() * comments.length);
    var comment = comments[commentIndex];
    
    sampleData.push([
      'C' + String(i + 1).padStart(4, '0'),
      Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      scores[i],
      comment
    ]);
  }
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // Format the sheet
  sheet.autoResizeColumns(1, headers.length);
  sheet.getRange('A:D').setNumberFormat('@');
  sheet.getRange('C:C').setNumberFormat('0.0');
  
  SpreadsheetApp.getUi().alert('✅ Sample satisfaction data added! (' + sampleData.length + ' responses)');
}

// =====================================================
// END OF CODE.GS
// =====================================================
