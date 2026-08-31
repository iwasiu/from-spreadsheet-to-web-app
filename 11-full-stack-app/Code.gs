/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 11
 * Business Management System
 * 
 * This is a full-stack web application that combines
 * all the concepts from previous chapters.
 * 
 * MODULES:
 * - Customers (CRUD operations)
 * - Sales (Transaction tracking)
 * - Inventory (Stock management)
 * - Dashboard (KPI visualization)
 * - Reports (PDF generation)
 * - Email (Automated communications)
 * =====================================================
 */

/**
 * =====================================================
 * DATABASE HELPERS
 * =====================================================
 */

function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('Sheet not found: ' + sheetName);
    return null;
  }
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return null;
  }
  var headers = data[0];
  var rows = data.slice(1).filter(function(row) {
    return row[0] && row[0] !== '';
  });
  return { headers: headers, rows: rows, sheet: sheet };
}

function generateId(prefix) {
  var timestamp = Date.now().toString(36).toUpperCase();
  var random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix + '-' + timestamp.substring(0, 4) + random;
}

function formatCurrency(amount) {
  return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getSetting(key) {
  var data = getSheetData('Settings');
  if (!data) return null;
  for (var i = 0; i < data.rows.length; i++) {
    if (data.rows[i][0] === key) {
      return data.rows[i][1];
    }
  }
  return null;
}

/**
 * =====================================================
 * CUSTOMERS MODULE
 * =====================================================
 */

function getCustomers() {
  var data = getSheetData('Customers');
  if (!data) return [];
  var customers = [];
  data.rows.forEach(function(row) {
    customers.push({
      id: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
      company: row[4],
      status: row[5] || 'Active'
    });
  });
  return customers;
}

function getCustomer(id) {
  var customers = getCustomers();
  return customers.find(function(c) { return c.id === id; });
}

function addCustomer(name, email, phone, company, status) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Customers');
  var id = generateId('C');
  sheet.appendRow([id, name, email, phone, company, status || 'Active']);
  return { success: true, id: id };
}

function updateCustomer(id, name, email, phone, company, status) {
  var data = getSheetData('Customers');
  if (!data) return { success: false, error: 'Customers sheet not found' };
  
  var sheet = data.sheet;
  for (var i = 0; i < data.rows.length; i++) {
    if (data.rows[i][0] === id) {
      var rowNum = i + 2;
      sheet.getRange(rowNum, 2).setValue(name);
      sheet.getRange(rowNum, 3).setValue(email);
      sheet.getRange(rowNum, 4).setValue(phone);
      sheet.getRange(rowNum, 5).setValue(company);
      sheet.getRange(rowNum, 6).setValue(status);
      return { success: true };
    }
  }
  return { success: false, error: 'Customer not found' };
}

function deleteCustomer(id) {
  var data = getSheetData('Customers');
  if (!data) return { success: false, error: 'Customers sheet not found' };
  
  var sheet = data.sheet;
  for (var i = 0; i < data.rows.length; i++) {
    if (data.rows[i][0] === id) {
      var rowNum = i + 2;
      sheet.deleteRow(rowNum);
      return { success: true };
    }
  }
  return { success: false, error: 'Customer not found' };
}

/**
 * =====================================================
 * SALES MODULE
 * =====================================================
 */

function getSales() {
  var data = getSheetData('Sales');
  if (!data) return [];
  var sales = [];
  data.rows.forEach(function(row) {
    sales.push({
      id: row[0],
      customerId: row[1],
      date: row[2],
      product: row[3],
      quantity: row[4],
      total: row[5]
    });
  });
  return sales;
}

function getSalesByCustomer(customerId) {
  var sales = getSales();
  return sales.filter(function(s) { return s.customerId === customerId; });
}

function addSale(customerId, date, product, quantity, total) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Sales');
  var id = generateId('S');
  sheet.appendRow([id, customerId, date, product, quantity, total]);
  
  // Update inventory
  updateInventory(product, -quantity);
  
  return { success: true, id: id };
}

function updateSale(id, customerId, date, product, quantity, total) {
  var data = getSheetData('Sales');
  if (!data) return { success: false, error: 'Sales sheet not found' };
  
  var sheet = data.sheet;
  for (var i = 0; i < data.rows.length; i++) {
    if (data.rows[i][0] === id) {
      var rowNum = i + 2;
      // Get old product and quantity for inventory adjustment
      var oldProduct = data.rows[i][3];
      var oldQuantity = data.rows[i][4];
      
      // Update inventory
      updateInventory(oldProduct, oldQuantity);
      updateInventory(product, -quantity);
      
      sheet.getRange(rowNum, 2).setValue(customerId);
      sheet.getRange(rowNum, 3).setValue(date);
      sheet.getRange(rowNum, 4).setValue(product);
      sheet.getRange(rowNum, 5).setValue(quantity);
      sheet.getRange(rowNum, 6).setValue(total);
      return { success: true };
    }
  }
  return { success: false, error: 'Sale not found' };
}

/**
 * =====================================================
 * INVENTORY MODULE
 * =====================================================
 */

function getInventory() {
  var data = getSheetData('Inventory');
  if (!data) return [];
  var items = [];
  data.rows.forEach(function(row) {
    items.push({
      id: row[0],
      product: row[1],
      category: row[2],
      stock: row[3],
      price: row[4]
    });
  });
  return items;
}

function getInventoryItem(id) {
  var items = getInventory();
  return items.find(function(i) { return i.id === id; });
}

function updateInventory(product, quantityChange) {
  var data = getSheetData('Inventory');
  if (!data) return { success: false, error: 'Inventory sheet not found' };
  
  var sheet = data.sheet;
  for (var i = 0; i < data.rows.length; i++) {
    if (data.rows[i][1] === product) {
      var rowNum = i + 2;
      var currentStock = data.rows[i][3];
      var newStock = Math.max(0, currentStock + quantityChange);
      sheet.getRange(rowNum, 4).setValue(newStock);
      return { success: true, newStock: newStock };
    }
  }
  return { success: false, error: 'Product not found' };
}

function addInventoryItem(product, category, stock, price) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Inventory');
  var id = generateId('P');
  sheet.appendRow([id, product, category, stock, price]);
  return { success: true, id: id };
}

function getLowStockItems(threshold) {
  var items = getInventory();
  var thresholdVal = threshold || 10;
  return items.filter(function(item) {
    return item.stock < thresholdVal;
  });
}

/**
 * =====================================================
 * DASHBOARD MODULE
 * =====================================================
 */

function getDashboardData() {
  var customers = getCustomers();
  var sales = getSales();
  var inventory = getInventory();
  
  // Calculate KPIs
  var totalCustomers = customers.length;
  var activeCustomers = customers.filter(function(c) { return c.status === 'Active'; }).length;
  var totalSales = sales.reduce(function(sum, s) { return sum + s.total; }, 0);
  var totalTransactions = sales.length;
  
  // Top products
  var productSales = {};
  sales.forEach(function(sale) {
    if (!productSales[sale.product]) productSales[sale.product] = 0;
    productSales[sale.product] += sale.quantity;
  });
  
  var topProduct = '';
  var topProductSales = 0;
  for (var product in productSales) {
    if (productSales[product] > topProductSales) {
      topProductSales = productSales[product];
      topProduct = product;
    }
  }
  
  // Recent sales
  var recentSales = sales.slice(-10).reverse();
  
  // Low stock items
  var lowStockItems = inventory.filter(function(item) {
    return item.stock < 10;
  });
  
  return {
    kpis: {
      totalCustomers: totalCustomers,
      activeCustomers: activeCustomers,
      totalSales: totalSales,
      totalTransactions: totalTransactions
    },
    topProduct: topProduct,
    topProductSales: topProductSales,
    recentSales: recentSales,
    lowStockItems: lowStockItems
  };
}

/**
 * =====================================================
 * REPORT MODULE
 * =====================================================
 */

function generateReportHTML(period) {
  var data = getDashboardData();
  var customers = getCustomers();
  var sales = getSales();
  var inventory = getInventory();
  
  // Filter sales by period
  var filteredSales = sales;
  if (period === 'month') {
    var now = new Date();
    filteredSales = sales.filter(function(s) {
      var saleDate = new Date(s.date);
      return saleDate.getMonth() === now.getMonth() && 
             saleDate.getFullYear() === now.getFullYear();
    });
  } else if (period === 'quarter') {
    var now = new Date();
    var quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth()/3)*3, 1);
    filteredSales = sales.filter(function(s) {
      var saleDate = new Date(s.date);
      return saleDate >= quarterStart;
    });
  }
  
  var totalSales = filteredSales.reduce(function(sum, s) { return sum + s.total; }, 0);
  var totalTransactions = filteredSales.length;
  
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Business Report</title>';
  html += '<style>';
  html += 'body { font-family: "Segoe UI", Arial, sans-serif; padding: 40px; color: #1a2a3a; }';
  html += '.header { border-bottom: 3px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }';
  html += '.header h1 { font-size: 28px; margin: 0; }';
  html += '.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }';
  html += '.summary-card { background: #f8faff; border: 1px solid #e6edf5; border-radius: 10px; padding: 16px 20px; text-align: center; }';
  html += '.summary-card .label { font-size: 12px; color: #5e6f8d; text-transform: uppercase; }';
  html += '.summary-card .value { font-size: 24px; font-weight: 600; margin-top: 4px; }';
  html += '.section { margin-bottom: 30px; }';
  html += '.section h2 { font-size: 18px; border-bottom: 2px solid #eef2f7; padding-bottom: 8px; margin-bottom: 16px; }';
  html += 'table { width: 100%; border-collapse: collapse; font-size: 14px; }';
  html += 'table th { background: #f4f7fc; padding: 10px 14px; text-align: left; border-bottom: 2px solid #dce3ed; }';
  html += 'table td { padding: 8px 14px; border-bottom: 1px solid #eef2f7; }';
  html += '.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eef2f7; font-size: 12px; color: #8a9bb5; text-align: center; }';
  html += '@media (max-width: 768px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }';
  html += '</style></head><body>';
  html += '<div class="header"><h1>Business Report</h1>';
  html += '<div>Generated: ' + new Date().toLocaleDateString() + '</div></div>';
  
  html += '<div class="summary-grid">';
  html += '<div class="summary-card"><div class="label">Total Sales</div><div class="value">' + formatCurrency(totalSales) + '</div></div>';
  html += '<div class="summary-card"><div class="label">Transactions</div><div class="value">' + totalTransactions + '</div></div>';
  html += '<div class="summary-card"><div class="label">Customers</div><div class="value">' + data.kpis.totalCustomers + '</div></div>';
  html += '<div class="summary-card"><div class="label">Active Customers</div><div class="value">' + data.kpis.activeCustomers + '</div></div>';
  html += '</div>';
  
  // Customer table
  html += '<div class="section"><h2>Customers</h2><table>';
  html += '<tr><th>ID</th><th>Name</th><th>Email</th><th>Company</th><th>Status</th></tr>';
  customers.slice(0, 10).forEach(function(c) {
    html += '<tr><td>' + c.id + '</td><td>' + c.name + '</td><td>' + c.email + '</td><td>' + (c.company || '—') + '</td><td>' + c.status + '</td></tr>';
  });
  html += '</table></div>';
  
  // Inventory table
  html += '<div class="section"><h2>Inventory</h2><table>';
  html += '<tr><th>Product</th><th>Category</th><th>Stock</th><th>Price</th></tr>';
  inventory.slice(0, 10).forEach(function(i) {
    html += '<tr><td>' + i.product + '</td><td>' + i.category + '</td><td>' + i.stock + '</td><td>' + formatCurrency(i.price) + '</td></tr>';
  });
  html += '</table></div>';
  
  html += '<div class="footer">Generated by Business Management System</div>';
  html += '</body></html>';
  
  return html;
}

/**
 * =====================================================
 * EMAIL MODULE
 * =====================================================
 */

function sendCustomerEmail(customerId, subject, message) {
  var customer = getCustomer(customerId);
  if (!customer) return { success: false, error: 'Customer not found' };
  
  try {
    GmailApp.sendEmail(
      customer.email,
      subject,
      message
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function sendBulkEmail(customerIds, subject, message) {
  var results = [];
  customerIds.forEach(function(id) {
    var result = sendCustomerEmail(id, subject, message);
    results.push({
      customerId: id,
      success: result.success,
      error: result.error
    });
  });
  return results;
}

/**
 * =====================================================
 * WEB APP FUNCTIONS
 * =====================================================
 */

function getWebAppData() {
  var dashboard = getDashboardData();
  var customers = getCustomers();
  var sales = getSales();
  var inventory = getInventory();
  
  return {
    dashboard: dashboard,
    customers: customers,
    sales: sales,
    inventory: inventory,
    settings: {
      companyName: getSetting('Company Name'),
      currency: getSetting('Default Currency'),
      taxRate: getSetting('Tax Rate')
    }
  };
}

function addCustomerWebApp(name, email, phone, company, status) {
  return addCustomer(name, email, phone, company, status);
}

function updateCustomerWebApp(id, name, email, phone, company, status) {
  return updateCustomer(id, name, email, phone, company, status);
}

function deleteCustomerWebApp(id) {
  return deleteCustomer(id);
}

function addSaleWebApp(customerId, date, product, quantity, total) {
  return addSale(customerId, date, product, quantity, total);
}

function getLowStockItemsWebApp(threshold) {
  return getLowStockItems(threshold);
}

function sendEmailWebApp(customerId, subject, message) {
  return sendCustomerEmail(customerId, subject, message);
}

function generateReportWebApp(period) {
  var html = generateReportHTML(period || 'month');
  var fileName = 'Business_Report_' + new Date().toISOString().split('T')[0];
  var pdfResult = generatePDF(html, fileName);
  return pdfResult;
}

function generatePDF(html, fileName) {
  var tempFile = DriveApp.createFile(fileName + '.html', html, 'text/html');
  var pdfBlob = tempFile.getAs('application/pdf');
  pdfBlob.setName(fileName + '.pdf');
  tempFile.setTrashed(true);
  var folder = DriveApp.getRootFolder();
  var pdfFile = folder.createFile(pdfBlob);
  return {
    success: true,
    fileId: pdfFile.getId(),
    fileName: pdfFile.getName(),
    fileUrl: pdfFile.getUrl()
  };
}

/**
 * =====================================================
 * SAMPLE DATA
 * =====================================================
 */

function addSampleData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create sheets if they don't exist
  var sheets = ['Customers', 'Sales', 'Inventory', 'Settings'];
  sheets.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });
  
  // Customers
  var customerSheet = ss.getSheetByName('Customers');
  customerSheet.clear();
  customerSheet.appendRow(['ID', 'Name', 'Email', 'Phone', 'Company', 'Status']);
  var customers = [
    ['C001', 'John Smith', 'john@example.com', '555-0101', 'Acme Corp', 'Active'],
    ['C002', 'Sarah Jones', 'sarah@example.com', '555-0102', 'Tech Inc', 'Active'],
    ['C003', 'Mike Brown', 'mike@example.com', '555-0103', 'Global Solutions', 'Active'],
    ['C004', 'Emily Davis', 'emily@example.com', '555-0104', 'Creative Agency', 'Inactive'],
    ['C005', 'David Wilson', 'david@example.com', '555-0105', 'Innovation Labs', 'Active']
  ];
  customers.forEach(function(row) {
    customerSheet.appendRow(row);
  });
  
  // Sales
  var salesSheet = ss.getSheetByName('Sales');
  salesSheet.clear();
  salesSheet.appendRow(['ID', 'Customer ID', 'Date', 'Product', 'Quantity', 'Total']);
  var sales = [
    ['S001', 'C001', '2024-01-15', 'Laptop', 2, 2400],
    ['S002', 'C002', '2024-01-16', 'Tablet', 1, 800],
    ['S003', 'C003', '2024-01-17', 'Monitor', 3, 1350],
    ['S004', 'C001', '2024-01-18', 'Keyboard', 5, 375],
    ['S005', 'C005', '2024-01-19', 'Laptop', 1, 1200],
    ['S006', 'C002', '2024-01-20', 'Mouse', 10, 250],
    ['S007', 'C003', '2024-01-21', 'Printer', 2, 600],
    ['S008', 'C004', '2024-01-22', 'Scanner', 1, 350],
    ['S009', 'C005', '2024-01-23', 'Tablet', 3, 2400],
    ['S010', 'C001', '2024-01-24', 'Monitor', 2, 900]
  ];
  sales.forEach(function(row) {
    salesSheet.appendRow(row);
  });
  
  // Inventory
  var inventorySheet = ss.getSheetByName('Inventory');
  inventorySheet.clear();
  inventorySheet.appendRow(['ID', 'Product', 'Category', 'Stock', 'Price']);
  var inventory = [
    ['P001', 'Laptop', 'Electronics', 45, 1200],
    ['P002', 'Tablet', 'Electronics', 30, 800],
    ['P003', 'Monitor', 'Computing', 25, 450],
    ['P004', 'Keyboard', 'Accessories', 80, 75],
    ['P005', 'Mouse', 'Accessories', 120, 25],
    ['P006', 'Printer', 'Office Supplies', 15, 300],
    ['P007', 'Scanner', 'Office Supplies', 8, 350]
  ];
  inventory.forEach(function(row) {
    inventorySheet.appendRow(row);
  });
  
  // Settings
  var settingsSheet = ss.getSheetByName('Settings');
  settingsSheet.clear();
  settingsSheet.appendRow(['Setting', 'Value']);
  var settings = [
    ['Company Name', 'Your Company'],
    ['Default Currency', 'USD'],
    ['Tax Rate', '10']
  ];
  settings.forEach(function(row) {
    settingsSheet.appendRow(row);
  });
  
  return { success: true };
}

// =====================================================
// END OF CODE.GS
// =====================================================
