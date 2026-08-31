/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 9
 * Executive Dashboard with Google Charts
 * 
 * This script creates a dynamic dashboard with
 * multiple charts and interactive filters.
 * 
 * KEY CONCEPTS:
 * - Data visualization with Google Charts
 * - Dashboard design principles
 * - Interactive filters
 * - Auto-refresh and real-time updates
 * =====================================================
 */

/**
 * =====================================================
 * DATA FUNCTIONS
 * =====================================================
 */

/**
 * getSalesData
 * ============
 * Reads sales data from the active sheet.
 * 
 * @returns {Object} - Sales data for dashboard
 */
function getSalesData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { success: false, error: 'No data found. Please add sales data to the sheet.' };
  }
  
  // Remove header row
  var headers = data.shift();
  
  // Identify columns (assumes standard format)
  var dateCol = 0;
  var salesCol = 1;
  var regionCol = 2;
  var productCol = 3;
  var repCol = 4;
  
  var salesData = [];
  var regions = {};
  var products = {};
  var reps = {};
  var monthlyData = {};
  
  var totalSales = 0;
  var maxSales = 0;
  var minSales = Infinity;
  var count = 0;
  
  data.forEach(function(row) {
    var date = row[dateCol];
    var sales = parseFloat(row[salesCol]) || 0;
    var region = row[regionCol] || 'Unknown';
    var product = row[productCol] || 'Unknown';
    var rep = row[repCol] || 'Unknown';
    
    // Skip invalid rows
    if (!date || sales === 0) return;
    
    // Format date for monthly grouping
    var dateObj = new Date(date);
    var monthKey = dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0');
    var monthLabel = dateObj.toLocaleString('default', { month: 'short' }) + ' ' + dateObj.getFullYear();
    
    // Store raw data
    salesData.push({
      date: date,
      sales: sales,
      region: region,
      product: product,
      rep: rep,
      monthKey: monthKey,
      monthLabel: monthLabel
    });
    
    // Aggregate by region
    if (!regions[region]) regions[region] = 0;
    regions[region] += sales;
    
    // Aggregate by product
    if (!products[product]) products[product] = 0;
    products[product] += sales;
    
    // Aggregate by rep
    if (!reps[rep]) reps[rep] = 0;
    reps[rep] += sales;
    
    // Aggregate by month
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        label: monthLabel,
        sales: 0,
        count: 0
      };
    }
    monthlyData[monthKey].sales += sales;
    monthlyData[monthKey].count += 1;
    
    // Totals
    totalSales += sales;
    if (sales > maxSales) maxSales = sales;
    if (sales < minSales) minSales = sales;
    count++;
  });
  
  // Convert monthly data to arrays for charting
  var monthlyKeys = Object.keys(monthlyData).sort();
  var monthlyLabels = monthlyKeys.map(function(key) { return monthlyData[key].label; });
  var monthlySales = monthlyKeys.map(function(key) { return monthlyData[key].sales; });
  
  // Convert regions to arrays for charting
  var regionNames = Object.keys(regions);
  var regionValues = regionNames.map(function(name) { return regions[name]; });
  
  // Convert products to arrays for charting
  var productNames = Object.keys(products);
  var productValues = productNames.map(function(name) { return products[name]; });
  
  // Convert reps to arrays for charting
  var repNames = Object.keys(reps);
  var repValues = repNames.map(function(name) { return reps[name]; });
  
  // Calculate KPIs
  var averageSales = count > 0 ? totalSales / count : 0;
  
  // Get top performer
  var topRegion = '';
  var topRegionValue = 0;
  regionNames.forEach(function(name) {
    if (regions[name] > topRegionValue) {
      topRegionValue = regions[name];
      topRegion = name;
    }
  });
  
  var topProduct = '';
  var topProductValue = 0;
  productNames.forEach(function(name) {
    if (products[name] > topProductValue) {
      topProductValue = products[name];
      topProduct = name;
    }
  });
  
  var topRep = '';
  var topRepValue = 0;
  repNames.forEach(function(name) {
    if (reps[name] > topRepValue) {
      topRepValue = reps[name];
      topRep = name;
    }
  });
  
  // Calculate month-over-month growth
  var monthOverMonthGrowth = 0;
  if (monthlySales.length >= 2) {
    var lastMonth = monthlySales[monthlySales.length - 1];
    var prevMonth = monthlySales[monthlySales.length - 2];
    if (prevMonth > 0) {
      monthOverMonthGrowth = ((lastMonth - prevMonth) / prevMonth) * 100;
    }
  }
  
  return {
    success: true,
    salesData: salesData,
    kpis: {
      totalSales: totalSales,
      averageSales: averageSales,
      maxSales: maxSales,
      minSales: minSales === Infinity ? 0 : minSales,
      count: count,
      monthOverMonthGrowth: monthOverMonthGrowth,
      topRegion: topRegion,
      topRegionValue: topRegionValue,
      topProduct: topProduct,
      topProductValue: topProductValue,
      topRep: topRep,
      topRepValue: topRepValue
    },
    charts: {
      monthly: {
        labels: monthlyLabels,
        values: monthlySales
      },
      regions: {
        labels: regionNames,
        values: regionValues
      },
      products: {
        labels: productNames,
        values: productValues
      },
      reps: {
        labels: repNames,
        values: repValues
      }
    },
    rawData: salesData
  };
}

/**
 * getFilteredData
 * ===============
 * Returns filtered data for the dashboard.
 * 
 * @param {string} region - Filter by region
 * @param {string} product - Filter by product
 * @returns {Object} - Filtered data
 */
function getFilteredData(region, product) {
  var allData = getSalesData();
  
  if (!allData.success) return allData;
  
  var filtered = allData.salesData;
  
  if (region && region !== 'All') {
    filtered = filtered.filter(function(item) {
      return item.region === region;
    });
  }
  
  if (product && product !== 'All') {
    filtered = filtered.filter(function(item) {
      return item.product === product;
    });
  }
  
  // Calculate KPIs for filtered data
  var totalSales = filtered.reduce(function(sum, item) { return sum + item.sales; }, 0);
  var count = filtered.length;
  var averageSales = count > 0 ? totalSales / count : 0;
  
  // Aggregate by month for filtered data
  var monthlyData = {};
  filtered.forEach(function(item) {
    if (!monthlyData[item.monthKey]) {
      monthlyData[item.monthKey] = {
        label: item.monthLabel,
        sales: 0
      };
    }
    monthlyData[item.monthKey].sales += item.sales;
  });
  
  var monthlyKeys = Object.keys(monthlyData).sort();
  var monthlyLabels = monthlyKeys.map(function(key) { return monthlyData[key].label; });
  var monthlySales = monthlyKeys.map(function(key) { return monthlyData[key].sales; });
  
  return {
    success: true,
    filtered: filtered,
    kpis: {
      totalSales: totalSales,
      averageSales: averageSales,
      count: count
    },
    charts: {
      monthly: {
        labels: monthlyLabels,
        values: monthlySales
      }
    }
  };
}

/**
 * getDashboardDataWebApp
 * ======================
 * Returns complete dashboard data for the web app.
 * 
 * @param {string} region - Filter by region
 * @param {string} product - Filter by product
 * @returns {Object} - Dashboard data
 */
function getDashboardDataWebApp(region, product) {
  try {
    var allData = getSalesData();
    
    if (!allData.success) {
      return allData;
    }
    
    // Get filtered data if filters are applied
    var filteredData = null;
    if ((region && region !== 'All') || (product && product !== 'All')) {
      filteredData = getFilteredData(region, product);
    }
    
    // Get unique regions and products for filters
    var regions = [];
    var products = [];
    allData.salesData.forEach(function(item) {
      if (item.region && !regions.includes(item.region)) {
        regions.push(item.region);
      }
      if (item.product && !products.includes(item.product)) {
        products.push(item.product);
      }
    });
    
    // Sort for consistency
    regions.sort();
    products.sort();
    
    return {
      success: true,
      allData: allData,
      filteredData: filteredData,
      filters: {
        regions: regions,
        products: products
      },
      hasFilters: (region && region !== 'All') || (product && product !== 'All')
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * =====================================================
 * ADD SAMPLE DATA
 * =====================================================
 */

/**
 * addSampleSalesData
 * ==================
 * Adds sample sales data to the sheet.
 */
function addSampleSalesData() {
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
  var headers = ['Date', 'Sales', 'Region', 'Product', 'Sales Rep'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Generate sample data
  var sampleData = [];
  var regions = ['North', 'South', 'East', 'West'];
  var products = ['Product A', 'Product B', 'Product C', 'Product D'];
  var reps = ['Sarah', 'Mike', 'John', 'Lisa', 'David', 'Emma'];
  
  var startDate = new Date(2024, 0, 1);
  
  for (var i = 0; i < 90; i++) {
    var date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    var region = regions[Math.floor(Math.random() * regions.length)];
    var product = products[Math.floor(Math.random() * products.length)];
    var rep = reps[Math.floor(Math.random() * reps.length)];
    
    // Sales with some randomness and trend
    var baseSales = 8000 + (i * 50) + Math.floor(Math.random() * 3000);
    var sales = Math.round(baseSales / 100) * 100;
    
    sampleData.push([
      Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      sales,
      region,
      product,
      rep
    ]);
  }
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // Format the sheet
  sheet.autoResizeColumns(1, headers.length);
  sheet.getRange('B:B').setNumberFormat('#,##0');
  
  SpreadsheetApp.getUi().alert('✅ Sample sales data added! (' + sampleData.length + ' records)');
}

// =====================================================
// END OF CODE.GS
// =====================================================
