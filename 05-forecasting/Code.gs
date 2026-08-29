/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 5
 * Sales Forecasting with Linear Regression
 * 
 * This script reads historical sales data,
 * calculates the trend line, and predicts future sales.
 * 
 * KEY CONCEPTS:
 * - Linear regression (slope, intercept, R²)
 * - Forecasting future periods
 * - Data visualization with Google Charts
 * =====================================================
 */

/**
 * =====================================================
 * CORE FORECASTING FUNCTIONS
 * =====================================================
 */

/**
 * calculateLinearRegression
 * =========================
 * Calculates the slope, intercept, and R² for a set of data points.
 * 
 * @param {number[]} xValues - Array of x values (e.g., months)
 * @param {number[]} yValues - Array of y values (e.g., sales)
 * @returns {Object} - { slope, intercept, rSquared, predictions }
 */
function calculateLinearRegression(xValues, yValues) {
  // --- Step 1: Validate inputs ---
  if (xValues.length !== yValues.length) {
    throw new Error('x and y arrays must have the same length.');
  }
  
  if (xValues.length < 2) {
    throw new Error('Need at least 2 data points for regression.');
  }
  
  var n = xValues.length;
  
  // --- Step 2: Calculate sums ---
  var sumX = 0;
  var sumY = 0;
  var sumXY = 0;
  var sumX2 = 0;
  var sumY2 = 0;
  
  for (var i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumX2 += xValues[i] * xValues[i];
    sumY2 += yValues[i] * yValues[i];
  }
  
  // --- Step 3: Calculate slope (m) ---
  var numerator = (n * sumXY) - (sumX * sumY);
  var denominator = (n * sumX2) - (sumX * sumX);
  
  if (denominator === 0) {
    throw new Error('Denominator is zero. Cannot calculate slope.');
  }
  
  var slope = numerator / denominator;
  
  // --- Step 4: Calculate intercept (b) ---
  var intercept = (sumY - slope * sumX) / n;
  
  // --- Step 5: Calculate R² (correlation coefficient squared) ---
  var meanY = sumY / n;
  var totalSumSquares = 0;
  var residualSumSquares = 0;
  
  for (var j = 0; j < n; j++) {
    var predicted = slope * xValues[j] + intercept;
    totalSumSquares += Math.pow(yValues[j] - meanY, 2);
    residualSumSquares += Math.pow(yValues[j] - predicted, 2);
  }
  
  var rSquared = 1 - (residualSumSquares / totalSumSquares);
  
  // --- Step 6: Generate predictions for existing data ---
  var predictions = xValues.map(function(x) {
    return slope * x + intercept;
  });
  
  // --- Step 7: Return results ---
  return {
    slope: slope,
    intercept: intercept,
    rSquared: rSquared,
    predictions: predictions,
    equation: 'y = ' + slope.toFixed(2) + 'x + ' + intercept.toFixed(2)
  };
}

/**
 * forecastFutureSales
 * ===================
 * Uses the regression model to predict future sales.
 * 
 * @param {Object} regression - Result from calculateLinearRegression()
 * @param {number} periods - Number of future periods to forecast
 * @param {number} lastX - The last x value in the historical data
 * @returns {Array} - Array of predicted values
 */
function forecastFutureSales(regression, periods, lastX) {
  var predictions = [];
  
  for (var i = 1; i <= periods; i++) {
    var futureX = lastX + i;
    var predictedY = regression.slope * futureX + regression.intercept;
    predictions.push({
      period: futureX,
      value: predictedY,
      formatted: '$' + predictedY.toFixed(2)
    });
  }
  
  return predictions;
}

/**
 * getSalesData
 * ============
 * Reads sales data from the active sheet.
 * Returns arrays of dates and sales values.
 */
function getSalesData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Remove header row
  var headers = data.shift();
  
  // Validate columns
  if (data.length === 0) {
    throw new Error('No data found. Please add sales data to the sheet.');
  }
  
  var dates = [];
  var sales = [];
  
  // Loop through each row
  data.forEach(function(row) {
    var date = row[0];
    var sale = row[1];
    
    // Skip invalid data
    if (!date || !sale) {
      return;
    }
    
    // Convert date to a number (months since start)
    var dateObj = new Date(date);
    var monthNumber = dateObj.getFullYear() * 12 + dateObj.getMonth();
    
    dates.push(monthNumber);
    sales.push(parseFloat(sale));
  });
  
  return {
    dates: dates,
    sales: sales,
    rawData: data
  };
}

/**
 * =====================================================
 * MAIN FORECAST FUNCTION
 * =====================================================
 */

/**
 * generateForecast
 * ================
 * Main function that generates a complete forecast.
 * Called from the web app and custom menu.
 * 
 * @param {number} periodsToForecast - Number of future periods to predict
 * @returns {Object} - Complete forecast results
 */
function generateForecast(periodsToForecast) {
  // --- Step 1: Get data ---
  var data = getSalesData();
  
  if (data.dates.length < 2) {
    throw new Error('Need at least 2 data points for forecasting.');
  }
  
  // --- Step 2: Calculate regression ---
  var regression = calculateLinearRegression(data.dates, data.sales);
  
  // --- Step 3: Generate predictions for historical data ---
  var historicalPredictions = data.dates.map(function(date, index) {
    return {
      period: date,
      actual: data.sales[index],
      predicted: regression.predictions[index]
    };
  });
  
  // --- Step 4: Generate future predictions ---
  var lastDate = data.dates[data.dates.length - 1];
  var futurePredictions = forecastFutureSales(regression, periodsToForecast, lastDate);
  
  // --- Step 5: Calculate summary statistics ---
  var avgSales = data.sales.reduce(function(sum, val) { return sum + val; }, 0) / data.sales.length;
  var lastActual = data.sales[data.sales.length - 1];
  var nextPrediction = futurePredictions.length > 0 ? futurePredictions[0].value : null;
  
  // --- Step 6: Build response ---
  return {
    regression: regression,
    historical: historicalPredictions,
    future: futurePredictions,
    summary: {
      avgSales: avgSales,
      lastActual: lastActual,
      nextPrediction: nextPrediction,
      growthRate: regression.slope / avgSales * 100 // percentage growth per period
    }
  };
}

/**
 * =====================================================
 * SPREADSHEET MENU FUNCTIONS
 * =====================================================
 */

/**
 * onOpen
 * ======
 * Creates a custom menu in the Google Sheet.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Forecast Tools')
    .addItem('Generate Forecast (6 months)', 'runForecast6Months')
    .addItem('Generate Forecast (12 months)', 'runForecast12Months')
    .addSeparator()
    .addItem('Add Sample Data', 'addSampleData')
    .addItem('Clear Forecast Results', 'clearForecastResults')
    .addToUi();
}

/**
 * runForecast6Months
 * =================
 * Runs forecast for 6 months and displays results.
 */
function runForecast6Months() {
  runForecastAndDisplay(6);
}

/**
 * runForecast12Months
 * ==================
 * Runs forecast for 12 months and displays results.
 */
function runForecast12Months() {
  runForecastAndDisplay(12);
}

/**
 * runForecastAndDisplay
 * =====================
 * Generates forecast and shows results in a dialog.
 */
function runForecastAndDisplay(periods) {
  try {
    var forecast = generateForecast(periods);
    displayForecastResults(forecast, periods);
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}

/**
 * displayForecastResults
 * ======================
 * Displays forecast results in a formatted dialog.
 */
function displayForecastResults(forecast, periods) {
  var r = forecast.regression;
  var s = forecast.summary;
  
  // Build the message
  var message = '📊 SALES FORECAST\n';
  message += '━'.repeat(42) + '\n\n';
  message += '📈 Regression Equation:\n';
  message += '   ' + r.equation + '\n\n';
  message += '📊 Fit Quality:\n';
  message += '   R² = ' + (r.rSquared * 100).toFixed(1) + '%\n';
  message += '   ' + getFitQualityDescription(r.rSquared) + '\n\n';
  message += '📋 Summary:\n';
  message += '   Average Sales   : $' + s.avgSales.toFixed(2) + '\n';
  message += '   Last Month      : $' + s.lastActual.toFixed(2) + '\n';
  message += '   Next Month      : $' + (s.nextPrediction ? s.nextPrediction.toFixed(2) : 'N/A') + '\n';
  message += '   Growth Rate     : ' + s.growthRate.toFixed(1) + '% per period\n\n';
  message += '🔮 Future Predictions (' + periods + ' months):\n';
  message += '━'.repeat(42) + '\n';
  
  forecast.future.forEach(function(p, index) {
    var periodLabel = 'Month ' + (index + 1);
    message += '   ' + periodLabel + ': ' + p.formatted + '\n';
  });
  
  message += '━'.repeat(42) + '\n\n';
  message += '💡 ' + getRecommendation(r.rSquared, s.growthRate);
  
  // Show the dialog
  var ui = SpreadsheetApp.getUi();
  ui.createAlertDialog()
    .setTitle('📊 Sales Forecast - ' + periods + ' Months')
    .setDescription(message)
    .setButtonSet(ui.ButtonSet.OK)
    .showModalDialog();
}

/**
 * getFitQualityDescription
 * ========================
 * Returns a description of the fit quality based on R².
 */
function getFitQualityDescription(rSquared) {
  if (rSquared > 0.9) return '✅ Excellent fit - Very reliable forecast';
  if (rSquared > 0.7) return '✅ Good fit - Reliable forecast';
  if (rSquared > 0.5) return '⚠️ Moderate fit - Use with caution';
  return '⚠️ Weak fit - Forecast may be unreliable';
}

/**
 * getRecommendation
 * =================
 * Provides a business recommendation based on the forecast.
 */
function getRecommendation(rSquared, growthRate) {
  if (rSquared < 0.5) {
    return 'The data doesn\'t show a clear trend. Consider using other methods (seasonal analysis, moving averages) for better accuracy.';
  }
  
  if (growthRate > 10) {
    return '📈 Strong growth detected! Consider increasing inventory and staff to meet growing demand.';
  }
  
  if (growthRate > 3) {
    return '📈 Steady growth detected. Maintain current operations and monitor closely.';
  }
  
  if (growthRate > -3) {
    return '📊 Stable demand. Focus on efficiency and customer retention.';
  }
  
  return '📉 Declining trend detected. Consider strategic changes to reverse the trend.';
}

/**
 * addSampleData
 * =============
 * Adds sample sales data to the sheet for testing.
 */
function addSampleData() {
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
  sheet.getRange(1, 1, 1, 2).setValues([['Date', 'Sales']]);
  
  // Generate sample data (24 months of sales with growth trend)
  var data = [];
  var baseSales = 10000;
  var growthRate = 1.02; // 2% monthly growth
  var startDate = new Date(2023, 0, 1); // January 1, 2023
  
  for (var i = 0; i < 24; i++) {
    var date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    // Add some random variation
    var randomVariation = 1 + (Math.random() - 0.5) * 0.15; // ±7.5%
    var sales = baseSales * Math.pow(growthRate, i) * randomVariation;
    
    data.push([
      Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      Math.round(sales)
    ]);
  }
  
  sheet.getRange(2, 1, data.length, 2).setValues(data);
  
  // Format the sheet
  sheet.getRange('A:B').setNumberFormat('@');
  sheet.getRange('B:B').setNumberFormat('#,##0');
  sheet.autoResizeColumns(1, 2);
  
  SpreadsheetApp.getUi().alert('✅ Sample data added! (24 months of sales data)');
}

/**
 * clearForecastResults
 * ====================
 * Clears any forecast results from the sheet.
 */
function clearForecastResults() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('⚠️ Warning', 'This will clear all forecast results from the sheet. Continue?', ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSheet();
    sheet.clear();
    ui.alert('✅ Sheet cleared successfully.');
  }
}

/**
 * =====================================================
 * WEB APP FUNCTIONS
 * =====================================================
 * These functions are called from the forecast web app
 * interface.
 */

/**
 * getForecastDataWebApp
 * =====================
 * Returns forecast data for the web app.
 * 
 * @param {number} periods - Number of periods to forecast
 * @returns {Object} - Complete forecast data
 */
function getForecastDataWebApp(periods) {
  try {
    var forecast = generateForecast(periods);
    
    // Prepare data for the web app
    var historicalData = forecast.historical.map(function(item) {
      return {
        period: item.period,
        actual: item.actual,
        predicted: item.predicted
      };
    });
    
    var futureData = forecast.future.map(function(item, index) {
      return {
        period: forecast.historical.length + index + 1,
        predicted: item.value,
        formatted: item.formatted
      };
    });
    
    return {
      success: true,
      regression: {
        slope: forecast.regression.slope,
        intercept: forecast.regression.intercept,
        rSquared: forecast.regression.rSquared,
        equation: forecast.regression.equation
      },
      historical: historicalData,
      future: futureData,
      summary: forecast.summary
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 =====================================================
 * END OF CODE.GS
 * =====================================================
 */
