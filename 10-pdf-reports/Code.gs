/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 10
 * Automated Report Generator
 * 
 * This script generates professional PDF reports
 * from Google Sheets data.
 * 
 * KEY CONCEPTS:
 * - HTML template generation
 * - PDF conversion using HTML
 * - Email automation
 * - Google Drive integration
 * =====================================================
 */

/**
 * =====================================================
 * DATA FUNCTIONS
 * =====================================================
 */

/**
 * getReportData
 * =============
 * Reads sales data from the active sheet.
 * 
 * @param {string} startDate - Optional start date filter
 * @param {string} endDate - Optional end date filter
 * @returns {Object} - Report data
 */
function getReportData(startDate, endDate) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { success: false, error: 'No data found. Please add sales data to the sheet.' };
  }
  
  // Remove header row
  var headers = data.shift();
  
  // Identify columns
  var dateCol = 0;
  var productCol = 1;
  var categoryCol = 2;
  var salesCol = 3;
  var quantityCol = 4;
  var regionCol = 5;
  
  var salesData = [];
  var totalSales = 0;
  var totalQuantity = 0;
  var productSales = {};
  var categorySales = {};
  var regionSales = {};
  
  data.forEach(function(row) {
    var date = row[dateCol];
    var product = row[productCol] || 'Unknown';
    var category = row[categoryCol] || 'Unknown';
    var sales = parseFloat(row[salesCol]) || 0;
    var quantity = parseFloat(row[quantityCol]) || 0;
    var region = row[regionCol] || 'Unknown';
    
    // Skip invalid rows
    if (!date || sales === 0) return;
    
    // Apply date filters if provided
    if (startDate && endDate) {
      var dateObj = new Date(date);
      var start = new Date(startDate);
      var end = new Date(endDate);
      if (dateObj < start || dateObj > end) return;
    }
    
    salesData.push({
      date: date,
      product: product,
      category: category,
      sales: sales,
      quantity: quantity,
      region: region
    });
    
    totalSales += sales;
    totalQuantity += quantity;
    
    if (!productSales[product]) productSales[product] = 0;
    productSales[product] += sales;
    
    if (!categorySales[category]) categorySales[category] = 0;
    categorySales[category] += sales;
    
    if (!regionSales[region]) regionSales[region] = 0;
    regionSales[region] += sales;
  });
  
  // Calculate summary statistics
  var averageSale = salesData.length > 0 ? totalSales / salesData.length : 0;
  
  // Get top product
  var topProduct = '';
  var topProductSales = 0;
  for (var product in productSales) {
    if (productSales[product] > topProductSales) {
      topProductSales = productSales[product];
      topProduct = product;
    }
  }
  
  // Get top category
  var topCategory = '';
  var topCategorySales = 0;
  for (var category in categorySales) {
    if (categorySales[category] > topCategorySales) {
      topCategorySales = categorySales[category];
      topCategory = category;
    }
  }
  
  // Get top region
  var topRegion = '';
  var topRegionSales = 0;
  for (var region in regionSales) {
    if (regionSales[region] > topRegionSales) {
      topRegionSales = regionSales[region];
      topRegion = region;
    }
  }
  
  return {
    success: true,
    salesData: salesData,
    summary: {
      totalSales: totalSales,
      totalQuantity: totalQuantity,
      averageSale: averageSale,
      totalTransactions: salesData.length,
      topProduct: topProduct,
      topProductSales: topProductSales,
      topCategory: topCategory,
      topCategorySales: topCategorySales,
      topRegion: topRegion,
      topRegionSales: topRegionSales
    },
    productSales: productSales,
    categorySales: categorySales,
    regionSales: regionSales
  };
}

/**
 * =====================================================
 * REPORT GENERATION FUNCTIONS
 * =====================================================
 */

/**
 * generateReportHTML
 * ==================
 * Generates an HTML report from the data.
 * 
 * @param {Object} data - Report data from getReportData()
 * @param {string} title - Report title
 * @param {string} companyName - Company name for branding
 * @returns {string} - HTML report
 */
function generateReportHTML(data, title, companyName) {
  var s = data.summary;
  var productRows = '';
  var categoryRows = '';
  var regionRows = '';
  var transactionRows = '';
  
  // Product table rows
  var productNames = Object.keys(data.productSales).sort();
  productNames.forEach(function(name) {
    var sales = data.productSales[name];
    var percentage = s.totalSales > 0 ? (sales / s.totalSales * 100).toFixed(1) : 0;
    productRows += '<tr>';
    productRows += '<td>' + name + '</td>';
    productRows += '<td>$' + sales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</td>';
    productRows += '<td>' + percentage + '%</td>';
    productRows += '</tr>';
  });
  
  // Category table rows
  var categoryNames = Object.keys(data.categorySales).sort();
  categoryNames.forEach(function(name) {
    var sales = data.categorySales[name];
    var percentage = s.totalSales > 0 ? (sales / s.totalSales * 100).toFixed(1) : 0;
    categoryRows += '<tr>';
    categoryRows += '<td>' + name + '</td>';
    categoryRows += '<td>$' + sales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</td>';
    categoryRows += '<td>' + percentage + '%</td>';
    categoryRows += '</tr>';
  });
  
  // Region table rows
  var regionNames = Object.keys(data.regionSales).sort();
  regionNames.forEach(function(name) {
    var sales = data.regionSales[name];
    var percentage = s.totalSales > 0 ? (sales / s.totalSales * 100).toFixed(1) : 0;
    regionRows += '<tr>';
    regionRows += '<td>' + name + '</td>';
    regionRows += '<td>$' + sales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</td>';
    regionRows += '<td>' + percentage + '%</td>';
    regionRows += '</tr>';
  });
  
  // Transaction table rows (limited to first 20 for readability)
  var transactions = data.salesData.slice(0, 20);
  transactions.forEach(function(row) {
    transactionRows += '<tr>';
    transactionRows += '<td>' + row.date + '</td>';
    transactionRows += '<td>' + row.product + '</td>';
    transactionRows += '<td>' + row.category + '</td>';
    transactionRows += '<td>$' + row.sales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</td>';
    transactionRows += '<td>' + row.quantity + '</td>';
    transactionRows += '<td>' + row.region + '</td>';
    transactionRows += '</tr>';
  });
  
  var company = companyName || 'Your Company';
  var reportTitle = title || 'Sales Report';
  var reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Build the HTML
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    /* ===== Base Styles ===== */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #ffffff;
      color: #1a2a3a;
      padding: 40px;
      line-height: 1.6;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    
    /* ===== Header ===== */
    .header {
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0b1a2b;
      margin-bottom: 4px;
    }
    .header .company {
      font-size: 16px;
      color: #5e6f8d;
    }
    .header .date {
      font-size: 14px;
      color: #8a9bb5;
    }
    
    /* ===== Summary Cards ===== */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8faff;
      border: 1px solid #e6edf5;
      border-radius: 10px;
      padding: 16px 20px;
      text-align: center;
    }
    .summary-card .label {
      font-size: 12px;
      color: #5e6f8d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: 600;
      color: #0b1a2b;
      margin-top: 4px;
    }
    .summary-card .value .currency {
      font-size: 16px;
      font-weight: 400;
      color: #5e6f8d;
    }
    
    /* ===== Tables ===== */
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #0b1a2b;
      border-bottom: 2px solid #eef2f7;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    table th {
      background: #f4f7fc;
      text-align: left;
      padding: 10px 14px;
      font-weight: 600;
      color: #1a2a3a;
      border-bottom: 2px solid #dce3ed;
    }
    table td {
      padding: 8px 14px;
      border-bottom: 1px solid #eef2f7;
    }
    table tr:hover {
      background: #f8faff;
    }
    table .total-row {
      background: #f4f7fc;
      font-weight: 600;
    }
    
    /* ===== Footer ===== */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eef2f7;
      font-size: 12px;
      color: #8a9bb5;
      text-align: center;
    }
    
    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      body { padding: 20px; }
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
      .summary-card .value { font-size: 20px; }
      table { font-size: 12px; }
      table th, table td { padding: 6px 10px; }
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- ===== HEADER ===== -->
    <div class="header">
      <h1>${reportTitle}</h1>
      <div class="company">${company}</div>
      <div class="date">Generated: ${reportDate}</div>
    </div>
    
    <!-- ===== SUMMARY ===== -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Total Sales</div>
        <div class="value"><span class="currency">$</span>${s.totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Quantity</div>
        <div class="value">${s.totalQuantity}</div>
      </div>
      <div class="summary-card">
        <div class="label">Average Sale</div>
        <div class="value"><span class="currency">$</span>${s.averageSale.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
      </div>
      <div class="summary-card">
        <div class="label">Transactions</div>
        <div class="value">${s.totalTransactions}</div>
      </div>
    </div>
    
    <!-- ===== TOP PERFORMERS ===== -->
    <div class="section">
      <h2>🏆 Top Performers</h2>
      <table>
        <tr>
          <th>Category</th>
          <th>Name</th>
          <th>Sales</th>
        </tr>
        <tr>
          <td><strong>Product</strong></td>
          <td>${s.topProduct}</td>
          <td>$${s.topProductSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
        </tr>
        <tr>
          <td><strong>Category</strong></td>
          <td>${s.topCategory}</td>
          <td>$${s.topCategorySales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
        </tr>
        <tr>
          <td><strong>Region</strong></td>
          <td>${s.topRegion}</td>
          <td>$${s.topRegionSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
        </tr>
      </table>
    </div>
    
    <!-- ===== PRODUCT BREAKDOWN ===== -->
    <div class="section">
      <h2>📦 Sales by Product</h2>
      <table>
        <tr>
          <th>Product</th>
          <th>Sales</th>
          <th>Percentage</th>
        </tr>
        ${productRows}
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td><strong>$${s.totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</strong></td>
          <td><strong>100%</strong></td>
        </tr>
      </table>
    </div>
    
    <!-- ===== CATEGORY BREAKDOWN ===== -->
    <div class="section">
      <h2>📊 Sales by Category</h2>
      <table>
        <tr>
          <th>Category</th>
          <th>Sales</th>
          <th>Percentage</th>
        </tr>
        ${categoryRows}
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td><strong>$${s.totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</strong></td>
          <td><strong>100%</strong></td>
        </tr>
      </table>
    </div>
    
    <!-- ===== REGION BREAKDOWN ===== -->
    <div class="section">
      <h2>🌍 Sales by Region</h2>
      <table>
        <tr>
          <th>Region</th>
          <th>Sales</th>
          <th>Percentage</th>
        </tr>
        ${regionRows}
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td><strong>$${s.totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</strong></td>
          <td><strong>100%</strong></td>
        </tr>
      </table>
    </div>
    
    <!-- ===== TRANSACTIONS ===== -->
    <div class="section">
      <h2>📋 Recent Transactions (Last ${transactions.length} Records)</h2>
      <table>
        <tr>
          <th>Date</th>
          <th>Product</th>
          <th>Category</th>
          <th>Sales</th>
          <th>Quantity</th>
          <th>Region</th>
        </tr>
        ${transactionRows}
        ${data.salesData.length > 20 ? '<tr><td colspan="6" style="text-align:center;color:#8a9bb5;padding:12px;">... and ' + (data.salesData.length - 20) + ' more transactions</td></tr>' : ''}
      </table>
    </div>
    
    <!-- ===== FOOTER ===== -->
    <div class="footer">
      Generated automatically by <strong>From Spreadsheet to Web App</strong>
      <br>
      This report is confidential and intended for ${company} use only.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * =====================================================
 * PDF GENERATION FUNCTIONS
 * =====================================================
 */

/**
 * generatePDF
 * ===========
 * Generates a PDF from HTML content.
 * 
 * @param {string} html - HTML content
 * @param {string} fileName - PDF file name
 * @param {string} folderId - Optional folder ID to save in
 * @returns {Object} - PDF file info
 */
function generatePDF(html, fileName, folderId) {
  // Create a temporary file in Google Drive
  var tempFile = DriveApp.createFile(
    fileName + '.html',
    html,
    'text/html'
  );
  
  // Convert HTML to PDF using the Drive API
  var pdfBlob = tempFile.getAs('application/pdf');
  
  // Set the PDF file name
  pdfBlob.setName(fileName + '.pdf');
  
  // Delete the temporary HTML file
  tempFile.setTrashed(true);
  
  // Save the PDF
  var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  var pdfFile = folder.createFile(pdfBlob);
  
  return {
    success: true,
    fileId: pdfFile.getId(),
    fileName: pdfFile.getName(),
    fileUrl: pdfFile.getUrl(),
    fileSize: pdfFile.getSize()
  };
}

/**
 * =====================================================
 * MAIN REPORT FUNCTIONS
 * =====================================================
 */

/**
 * generateAndSendReport
 * =====================
 * Main function to generate and send a report.
 * 
 * @param {string} emailTo - Recipient email
 * @param {string} reportTitle - Report title
 * @param {string} companyName - Company name
 * @param {string} startDate - Optional start date filter
 * @param {string} endDate - Optional end date filter
 * @param {string} saveFolderId - Optional folder ID
 * @returns {Object} - Result
 */
function generateAndSendReport(emailTo, reportTitle, companyName, startDate, endDate, saveFolderId) {
  try {
    // Step 1: Get data
    var data = getReportData(startDate, endDate);
    if (!data.success) {
      return data;
    }
    
    // Step 2: Generate HTML
    var html = generateReportHTML(data, reportTitle, companyName);
    
    // Step 3: Generate PDF
    var fileName = (reportTitle || 'Sales Report') + ' - ' + new Date().toISOString().split('T')[0];
    var pdfResult = generatePDF(html, fileName, saveFolderId);
    
    if (!pdfResult.success) {
      return pdfResult;
    }
    
    // Step 4: Send email with PDF
    if (emailTo) {
      sendReportEmail(emailTo, reportTitle, companyName, pdfResult.fileId);
    }
    
    return {
      success: true,
      pdfFileId: pdfResult.fileId,
      pdfUrl: pdfResult.fileUrl,
      fileName: pdfResult.fileName
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * sendReportEmail
 * ===============
 * Sends an email with the report as an attachment.
 * 
 * @param {string} emailTo - Recipient email
 * @param {string} reportTitle - Report title
 * @param {string} companyName - Company name
 * @param {string} pdfFileId - PDF file ID
 */
function sendReportEmail(emailTo, reportTitle, companyName, pdfFileId) {
  var subject = reportTitle + ' - ' + new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  var body = 'Dear Team,\n\n';
  body += 'Please find attached the ' + reportTitle + ' for ' + new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + '.\n\n';
  body += 'This report was generated automatically by the ' + companyName + ' Report System.\n\n';
  body += 'If you have any questions, please let us know.\n\n';
  body += 'Best regards,\n';
  body += companyName + ' Team\n';
  body += '---\n';
  body += 'This email was sent automatically. Please do not reply directly to this email.';
  
  var pdfFile = DriveApp.getFileById(pdfFileId);
  
  GmailApp.sendEmail(
    emailTo,
    subject,
    body,
    {
      attachments: [pdfFile.getAs('application/pdf')],
      name: companyName + ' Reports'
    }
  );
}

/**
 * =====================================================
 * WEB APP FUNCTIONS
 * =====================================================
 */

/**
 * generateReportWebApp
 * ====================
 * Generates a report from the web app.
 * 
 * @param {string} reportTitle - Report title
 * @param {string} companyName - Company name
 * @param {string} startDate - Optional start date filter
 * @param {string} endDate - Optional end date filter
 * @returns {Object} - Report result
 */
function generateReportWebApp(reportTitle, companyName, startDate, endDate) {
  try {
    var data = getReportData(startDate, endDate);
    if (!data.success) {
      return data;
    }
    
    var html = generateReportHTML(data, reportTitle, companyName);
    
    return {
      success: true,
      html: html,
      summary: data.summary,
      dataCount: data.salesData.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * downloadPDFWebApp
 * =================
 * Generates and returns a PDF blob for download.
 * 
 * @param {string} html - HTML content
 * @param {string} fileName - File name
 * @returns {Object} - PDF result
 */
function downloadPDFWebApp(html, fileName) {
  try {
    var pdfResult = generatePDF(html, fileName);
    return pdfResult;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * savePDFWebApp
 * =============
 * Saves a PDF to Google Drive.
 * 
 * @param {string} html - HTML content
 * @param {string} fileName - File name
 * @param {string} folderId - Optional folder ID
 * @returns {Object} - Save result
 */
function savePDFWebApp(html, fileName, folderId) {
  try {
    var pdfResult = generatePDF(html, fileName, folderId);
    return pdfResult;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * sendEmailWebApp
 * ===============
 * Sends a report via email from the web app.
 * 
 * @param {string} emailTo - Recipient email
 * @param {string} reportTitle - Report title
 * @param {string} companyName - Company name
 * @param {string} html - HTML content
 * @param {string} fileName - File name
 * @returns {Object} - Email result
 */
function sendEmailWebApp(emailTo, reportTitle, companyName, html, fileName) {
  try {
    // Generate PDF
    var pdfResult = generatePDF(html, fileName);
    if (!pdfResult.success) {
      return pdfResult;
    }
    
    // Send email
    sendReportEmail(emailTo, reportTitle, companyName, pdfResult.fileId);
    
    return {
      success: true,
      message: 'Email sent successfully to ' + emailTo
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
  var headers = ['Date', 'Product', 'Category', 'Sales', 'Quantity', 'Region'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Generate sample data
  var sampleData = [];
  var products = ['Laptop', 'Tablet', 'Phone', 'Monitor', 'Keyboard', 'Mouse', 'Printer', 'Scanner'];
  var categories = ['Electronics', 'Accessories', 'Office Supplies', 'Computing'];
  var regions = ['North', 'South', 'East', 'West'];
  
  var startDate = new Date(2024, 0, 1);
  
  for (var i = 0; i < 60; i++) {
    var date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 90));
    
    var product = products[Math.floor(Math.random() * products.length)];
    var category = categories[Math.floor(Math.random() * categories.length)];
    var region = regions[Math.floor(Math.random() * regions.length)];
    var quantity = Math.floor(Math.random() * 20) + 1;
    var unitPrice = Math.floor(Math.random() * 500) + 50;
    var sales = quantity * unitPrice;
    
    sampleData.push([
      Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      product,
      category,
      Math.round(sales / 10) * 10,
      quantity,
      region
    ]);
  }
  
  // Sort by date
  sampleData.sort(function(a, b) {
    return new Date(a[0]) - new Date(b[0]);
  });
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // Format the sheet
  sheet.autoResizeColumns(1, headers.length);
  sheet.getRange('D:D').setNumberFormat('#,##0');
  
  SpreadsheetApp.getUi().alert('✅ Sample sales data added! (' + sampleData.length + ' records)');
}

// =====================================================
// END OF CODE.GS
// =====================================================
