function analyzeSales(salesData) {
  /*
    This is a custom function.
    It takes a column of numbers, calculates the total,
    the average, and flags values more than 2 standard
    deviations above or below the mean.
  */
  
  // Step 1: Flatten the data (in case it's a row or column)
  var numbers = salesData.flat();
  
  // Step 2: Calculate the TOTAL (Arithmetic)
  var total = numbers.reduce(function(sum, num) {
    return sum + num;
  }, 0);
  
  // Step 3: Calculate the AVERAGE (Mean)
  var average = total / numbers.length;
  
  // Step 4: Calculate the STANDARD DEVIATION (Statistics)
  var squaredDiffs = numbers.map(function(num) {
    return Math.pow(num - average, 2);
  });
  var variance = squaredDiffs.reduce(function(sum, val) {
    return sum + val;
  }, 0) / numbers.length;
  var stdDev = Math.sqrt(variance);
  
  // Step 5: Flag outliers (2 standard deviations away)
  var outliers = numbers.filter(function(num) {
    return Math.abs(num - average) > 2 * stdDev;
  });
  
  // Step 6: Return a clean summary
  return {
    "Total Sales": total,
    "Average Sales": average,
    "Standard Deviation": stdDev,
    "Flagged Outliers": outliers.length > 0 ? outliers : "None"
  };
}
