/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 7
 * Inventory Management with Algebra
 * 
 * This script tracks inventory levels, calculates
 * reorder points, and generates purchase orders.
 * 
 * KEY CONCEPTS:
 * - EOQ (Economic Order Quantity)
 * - Reorder Point (ROP)
 * - Safety Stock
 * - Inventory Turnover
 * - Automatic alerts and notifications
 * =====================================================
 */

/**
 * =====================================================
 * CORE INVENTORY FUNCTIONS
 * =====================================================
 */

/**
 * calculateReorderPoint
 * =====================
 * Calculates the reorder point for a product.
 * 
 * @param {number} dailyDemand - Average units sold per day
 * @param {number} leadTime - Days between ordering and receiving
 * @param {number} safetyStock - Extra stock to protect against uncertainty
 * @returns {number} - Reorder point (units)
 */
function calculateReorderPoint(dailyDemand, leadTime, safetyStock) {
  return (dailyDemand * leadTime) + safetyStock;
}

/**
 * calculateEOQ
 * ============
 * Calculates Economic Order Quantity.
 * 
 * @param {number} annualDemand - Units demanded per year
 * @param {number} orderingCost - Cost per order ($)
 * @param {number} holdingCost - Cost to hold one unit for one year ($)
 * @returns {number} - EOQ (optimal order quantity)
 */
function calculateEOQ(annualDemand, orderingCost, holdingCost) {
  if (holdingCost === 0) {
    return annualDemand; // Can't calculate, return annual demand
  }
  return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
}

/**
 * calculateSafetyStock
 * ====================
 * Calculates safety stock using the simplified formula.
 * 
 * @param {number} maxDailyDemand - Maximum daily sales
 * @param {number} avgDailyDemand - Average daily sales
 * @param {number} maxLeadTime - Maximum lead time (days)
 * @param {number} avgLeadTime - Average lead time (days)
 * @returns {number} - Safety stock (units)
 */
function calculateSafetyStock(maxDailyDemand, avgDailyDemand, maxLeadTime, avgLeadTime) {
  return (maxDailyDemand * maxLeadTime) - (avgDailyDemand * avgLeadTime);
}

/**
 * calculateTurnover
 * =================
 * Calculates inventory turnover ratio.
 * 
 * @param {number} costOfGoodsSold - Annual COGS ($)
 * @param {number} averageInventory - Average inventory value ($)
 * @returns {number} - Inventory turnover
 */
function calculateTurnover(costOfGoodsSold, averageInventory) {
  if (averageInventory === 0) {
    return 0;
  }
  return costOfGoodsSold / averageInventory;
}

/**
 * =====================================================
 * INVENTORY DATA FUNCTIONS
 * =====================================================
 */

/**
 * getInventoryData
 * ================
 * Reads inventory data from the active sheet.
 * 
 * @returns {Array} - Array of inventory items
 */
function getInventoryData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Remove header row
  var headers = data.shift();
  
  var items = [];
  
  data.forEach(function(row) {
    // Skip empty rows
    if (!row[0] || row[0] === '') {
      return;
    }
    
    var item = {
      product: row[0] || '',
      sku: row[1] || '',
      currentStock: parseFloat(row[2]) || 0,
      dailyDemand: parseFloat(row[3]) || 0,
      leadTime: parseFloat(row[4]) || 0,
      safetyStock: parseFloat(row[5]) || 0,
      reorderPoint: parseFloat(row[6]) || 0,
      reorderQuantity: parseFloat(row[7]) || 0,
      supplier: row[8] || '',
      // Additional fields for calculations
      reorderAlert: false,
      daysUntilReorder: null,
      recommendedOrder: 0
    };
    
    // Calculate reorder point if not set
    if (!item.reorderPoint || item.reorderPoint === 0) {
      item.reorderPoint = calculateReorderPoint(
        item.dailyDemand,
        item.leadTime,
        item.safetyStock
      );
    }
    
    // Determine if reorder is needed
    if (item.currentStock < item.reorderPoint) {
      item.reorderAlert = true;
      item.recommendedOrder = item.reorderQuantity || 
        calculateEOQ(item.dailyDemand * 365, 50, 2);
    }
    
    items.push(item);
  });
  
  return items;
}

/**
 * updateInventorySheet
 * ====================
 * Updates the inventory sheet with calculated values.
 * 
 * @param {Array} items - Array of inventory items
 */
function updateInventorySheet(items) {
  var sheet = SpreadsheetApp.getActiveSheet();
  
  // Get the data range
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  
  // Update each row
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var sku = row[1]; // SKU column
    
    // Find matching item
    var matchingItem = items.find(function(item) {
      return item.sku === sku;
    });
    
    if (matchingItem) {
      // Update reorder point column (G)
      sheet.getRange(i + 1, 7).setValue(matchingItem.reorderPoint);
      
      // Update reorder alert status (we'll add a new column for this)
      // For now, just update the current stock
    }
  }
}

/**
 * =====================================================
 * PURCHASE ORDER GENERATION
 * =====================================================
 */

/**
 * generatePurchaseOrder
 * =====================
 * Generates a purchase order for items that need reordering.
 * 
 * @param {Array} items - Items to order
 * @param {string} supplierName - Optional supplier filter
 * @returns {Object} - Purchase order data
 */
function generatePurchaseOrder(items, supplierName) {
  // Filter items that need reordering
  var itemsToOrder = items.filter(function(item) {
    return item.reorderAlert === true;
  });
  
  // Filter by supplier if specified
  if (supplierName && supplierName !== 'All Suppliers') {
    itemsToOrder = itemsToOrder.filter(function(item) {
      return item.supplier === supplierName;
    });
  }
  
  // Group by supplier
  var groupedBySupplier = {};
  itemsToOrder.forEach(function(item) {
    if (!groupedBySupplier[item.supplier]) {
      groupedBySupplier[item.supplier] = [];
    }
    groupedBySupplier[item.supplier].push(item);
  });
  
  // Calculate totals
  var totalItems = itemsToOrder.length;
  var totalCost = 0;
  
  itemsToOrder.forEach(function(item) {
    // Assuming average cost of $10 per unit (simplified)
    totalCost += item.recommendedOrder * 10;
  });
  
  return {
    items: itemsToOrder,
    groupedBySupplier: groupedBySupplier,
    summary: {
      totalItems: totalItems,
      totalCost: totalCost,
      suppliers: Object.keys(groupedBySupplier)
    }
  };
}

/**
 * formatPurchaseOrder
 * ===================
 * Formats a purchase order as text.
 * 
 * @param {Object} purchaseOrder - Purchase order data
 * @returns {string} - Formatted purchase order
 */
function formatPurchaseOrder(purchaseOrder) {
  var output = '📋 PURCHASE ORDER\n';
  output += '━'.repeat(50) + '\n';
  output += 'Date: ' + new Date().toLocaleDateString() + '\n';
  output += '━'.repeat(50) + '\n\n';
  
  var grouped = purchaseOrder.groupedBySupplier;
  var supplierNames = Object.keys(grouped);
  
  supplierNames.forEach(function(supplier) {
    var items = grouped[supplier];
    
    output += '🏢 Supplier: ' + supplier + '\n';
    output += '━'.repeat(40) + '\n';
    
    items.forEach(function(item) {
      output += '   • ' + item.product + ' (SKU: ' + item.sku + ')\n';
      output += '     Current: ' + item.currentStock + ' units\n';
      output += '     Order: ' + item.recommendedOrder + ' units\n';
      output += '     Reorder Point: ' + item.reorderPoint + ' units\n\n';
    });
    
    output += '━'.repeat(40) + '\n\n';
  });
  
  output += '📊 SUMMARY:\n';
  output += '   Total Items to Order: ' + purchaseOrder.summary.totalItems + '\n';
  output += '   Suppliers: ' + purchaseOrder.summary.suppliers.join(', ') + '\n';
  output += '   Estimated Total Cost: $' + purchaseOrder.summary.totalCost.toFixed(2) + '\n';
  output += '━'.repeat(50) + '\n';
  output += 'Generated by Inventory Manager\n';
  
  return output;
}

/**
 * =====================================================
 * WEB APP FUNCTIONS
 * =====================================================
 */

/**
 * getInventoryDataWebApp
 * ======================
 * Returns inventory data for the web app.
 * 
 * @returns {Object} - Inventory data
 */
function getInventoryDataWebApp() {
  try {
    var items = getInventoryData();
    
    var totalProducts = items.length;
    var lowStockItems = items.filter(function(item) {
      return item.reorderAlert === true;
    });
    var lowStockCount = lowStockItems.length;
    
    return {
      success: true,
      items: items,
      summary: {
        totalProducts: totalProducts,
        lowStockCount: lowStockCount,
        lowStockPercentage: totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * generatePurchaseOrderWebApp
 * ===========================
 * Generates a purchase order for the web app.
 * 
 * @param {string} supplierName - Optional supplier filter
 * @returns {Object} - Purchase order data
 */
function generatePurchaseOrderWebApp(supplierName) {
  try {
    var items = getInventoryData();
    var purchaseOrder = generatePurchaseOrder(items, supplierName);
    
    return {
      success: true,
      purchaseOrder: purchaseOrder,
      formatted: formatPurchaseOrder(purchaseOrder)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * getSuppliersWebApp
 * ==================
 * Returns a list of unique suppliers.
 * 
 * @returns {Array} - List of supplier names
 */
function getSuppliersWebApp() {
  var items = getInventoryData();
  var suppliers = [];
  
  items.forEach(function(item) {
    if (item.supplier && !suppliers.includes(item.supplier)) {
      suppliers.push(item.supplier);
    }
  });
  
  return suppliers;
}

/**
 * updateStockWebApp
 * =================
 * Updates stock levels for a product.
 * 
 * @param {string} sku - Product SKU
 * @param {number} newStock - New stock level
 * @returns {Object} - Update result
 */
function updateStockWebApp(sku, newStock) {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === sku) {
        sheet.getRange(i + 1, 3).setValue(newStock);
        return {
          success: true,
          message: 'Stock updated for SKU: ' + sku
        };
      }
    }
    
    return {
      success: false,
      message: 'SKU not found: ' + sku
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error: ' + error.message
    };
  }
}

/**
 * addSampleInventoryData
 * ======================
 * Adds sample inventory data to the sheet.
 */
function addSampleInventoryData() {
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
  var headers = ['Product', 'SKU', 'Current Stock', 'Daily Demand', 'Lead Time (Days)', 
                 'Safety Stock', 'Reorder Point', 'Reorder Quantity', 'Supplier'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Add sample data
  var sampleData = [
    ['Olive Oil', 'OIL-001', 45, 5, 7, 20, 55, 100, 'Italian Imports Co.'],
    ['Balsamic Vinegar', 'BAL-002', 30, 3, 5, 10, 25, 60, 'Italian Imports Co.'],
    ['Pasta', 'PAS-003', 120, 8, 3, 15, 39, 120, 'Local Distributor'],
    ['Coffee', 'COF-004', 25, 6, 7, 15, 57, 80, 'Premium Roasters'],
    ['Tea', 'TEA-005', 80, 4, 5, 10, 30, 70, 'Premium Roasters'],
    ['Chocolate', 'CHO-006', 15, 2, 10, 10, 30, 40, 'Swiss Chocolate Co.'],
    ['Canned Tomatoes', 'CAN-007', 200, 15, 4, 20, 80, 200, 'Local Distributor'],
    ['Flour', 'FLO-008', 90, 7, 5, 15, 50, 100, 'Local Distributor'],
    ['Sugar', 'SUG-009', 60, 5, 5, 10, 35, 80, 'Local Distributor'],
    ['Honey', 'HON-010', 35, 3, 7, 10, 31, 50, 'Local Farm']
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // Format the sheet
  sheet.autoResizeColumns(1, headers.length);
  sheet.getRange('A:I').setNumberFormat('@');
  
  // Calculate reorder points
  var items = getInventoryData();
  items.forEach(function(item, index) {
    var rowIndex = index + 2;
    sheet.getRange(rowIndex, 7).setValue(item.reorderPoint);
  });
  
  SpreadsheetApp.getUi().alert('✅ Sample inventory data added!');
}

// =====================================================
// END OF CODE.GS
// =====================================================
