/**
 * =====================================================
 * FROM SPREADSHEET TO WEB APP - CHAPTER 4
 * Bulk Email Sender with Loops and Logic
 * 
 * This script reads customer data from Google Sheets,
 * generates personalized emails, and sends them via Gmail.
 * 
 * KEY CONCEPTS:
 * - forEach loops for processing each customer
 * - map, filter, reduce for data manipulation
 * - Business logic with conditional statements
 * - Web app integration
 * =====================================================
 */

/**
 * =====================================================
 * SPREADSHEET MENU FUNCTIONS
 * =====================================================
 */

/**
 * sendBulkEmails
 * ==============
 * Main function that reads customer data and sends emails.
 * This can be triggered from a custom menu in the sheet.
 */
function sendBulkEmails() {
  // --- Step 1: Get the active sheet ---
  var sheet = SpreadsheetApp.getActiveSheet();
  
  // --- Step 2: Get all data (including headers) ---
  var data = sheet.getDataRange().getValues();
  
  // --- Step 3: Remove the header row ---
  var headers = data.shift(); // This removes the first row (headers)
  
  // --- Step 4: Validate that we have data ---
  if (data.length === 0) {
    SpreadsheetApp.getUi().alert('❌ No data found. Please add customer data to the sheet.');
    return;
  }
  
  // --- Step 5: Create an array to store results ---
  var results = [];
  
  // --- Step 6: Loop through each customer (forEach loop) ---
  data.forEach(function(row, index) {
    var customer = {
      name: row[0],
      email: row[1],
      balance: row[2],
      lastPurchase: row[3],
      tier: row[4],
      rowNumber: index + 2 // +2 because row 1 is header, so row 2 is first data row
    };
    
    // --- Step 7: Skip if email is missing ---
    if (!customer.email || customer.email === '') {
      results.push('❌ Row ' + customer.rowNumber + ': Skipped (no email)');
      return;
    }
    
    // --- Step 8: Skip if name is missing ---
    if (!customer.name || customer.name === '') {
      results.push('❌ Row ' + customer.rowNumber + ': Skipped (no name)');
      return;
    }
    
    // --- Step 9: Generate personalized email content ---
    var emailContent = generateEmail(customer);
    
    // --- Step 10: Send the email ---
    try {
      GmailApp.sendEmail(
        customer.email,
        emailContent.subject,
        emailContent.body
      );
      results.push('✅ Row ' + customer.rowNumber + ': Email sent to ' + customer.name);
    } catch (error) {
      results.push('❌ Row ' + customer.rowNumber + ': Error - ' + error.message);
    }
  });
  
  // --- Step 11: Show summary results ---
  showResults(results);
}

/**
 * generateEmail
 * =============
 * Generates personalized email content based on customer data.
 * Uses the customer's tier to customize the message.
 * 
 * @param {Object} customer - Customer data object
 * @returns {Object} - Email content with subject and body
 */
function generateEmail(customer) {
  // --- Step 1: Calculate days since last purchase ---
  var today = new Date();
  var lastPurchaseDate = new Date(customer.lastPurchase);
  var daysSincePurchase = Math.floor((today - lastPurchaseDate) / (1000 * 60 * 60 * 24));
  
  // --- Step 2: Determine message based on tier (business logic) ---
  var specialMessage = '';
  var subjectPrefix = '';
  
  switch (customer.tier) {
    case 'Platinum':
      specialMessage = 'As one of our most valued Platinum members, we wanted to personally thank you for your continued business. Your loyalty means everything to us.\n\nWe\'ve added a special 15% discount to your account for your next purchase. Use code PLATINUM15 at checkout.';
      subjectPrefix = '🔹 Exclusive Platinum Update';
      break;
    case 'Gold':
      specialMessage = 'Thank you for being a Gold member! Your loyalty has not gone unnoticed. We\'ve added a 10% discount to your account for your next purchase. Use code GOLD10 at checkout.';
      subjectPrefix = '🔸 Gold Member Update';
      break;
    case 'Silver':
      specialMessage = 'We appreciate your business! As a Silver member, you\'re eligible for a 5% discount on your next purchase. Use code SILVER5 at checkout.';
      subjectPrefix = '⭐ Silver Member Update';
      break;
    default:
      specialMessage = 'We value your business and wanted to check in with you. We hope to serve you again soon!';
      subjectPrefix = '💌 Customer Update';
  }
  
  // --- Step 3: Add urgency based on days since last purchase ---
  var urgencyMessage = '';
  if (daysSincePurchase > 90) {
    urgencyMessage = '\n\nIt\'s been over 3 months since your last purchase. We\'d love to see you again! Visit our store or website to see what\'s new.';
  } else if (daysSincePurchase > 30) {
    urgencyMessage = '\n\nIt\'s been a while since your last visit. We\'ve added some exciting new products that we think you\'ll love.';
  } else {
    urgencyMessage = '\n\nThanks for your recent purchase! We hope you\'re enjoying your new items.';
  }
  
  // --- Step 4: Generate a unique discount code (exercise from the book) ---
  var discountCode = generateDiscountCode(customer.name);
  
  // --- Step 5: Build the email body ---
  var body = 'Dear ' + customer.name + ',\n\n';
  body += 'We hope this message finds you well!\n\n';
  body += specialMessage + '\n\n';
  body += '📊 Account Summary:\n';
  body += '   • Current Balance: $' + customer.balance.toLocaleString() + '\n';
  body += '   • Last Purchase: ' + customer.lastPurchase + ' (' + daysSincePurchase + ' days ago)\n';
  body += '   • Current Tier: ' + customer.tier + '\n';
  body += '   • Discount Code: ' + discountCode + '\n\n';
  body += urgencyMessage + '\n\n';
  body += 'Thank you for being a valued customer.\n\n';
  body += 'Best regards,\n';
  body += 'Your Company Team\n';
  body += '---\n';
  body += 'This email was automatically generated. Please reply if you have any questions.';
  
  // --- Step 6: Build the subject line ---
  var subject = subjectPrefix + ' for ' + customer.name;
  
  // --- Step 7: Return the email content ---
  return {
    subject: subject,
    body: body
  };
}

/**
 * generateDiscountCode
 * ====================
 * Generates a unique discount code for each customer.
 * Format: TIER-NAME-RANDOM
 * 
 * @param {string} name - Customer name
 * @returns {string} - Unique discount code
 */
function generateDiscountCode(name) {
  // Take first 3 letters of name, uppercase
  var nameCode = name.substring(0, 3).toUpperCase();
  // Generate a random 4-digit number
  var random = Math.floor(Math.random() * 9000 + 1000);
  // Add a tier prefix
  var tier = 'VIP';
  
  return tier + '-' + nameCode + '-' + random;
}

/**
 * showResults
 * ===========
 * Displays the results of the email sending process.
 * Uses filter to count successes and failures.
 * 
 * @param {string[]} results - Array of result messages
 */
function showResults(results) {
  // --- Step 1: Count successes and failures (filter method) ---
  var successCount = results.filter(function(r) {
    return r.indexOf('✅') !== -1;
  }).length;
  
  var failureCount = results.filter(function(r) {
    return r.indexOf('❌') !== -1;
  }).length;
  
  // --- Step 2: Create summary ---
  var summary = '📧 EMAIL SENDING COMPLETE\n';
  summary += '━'.repeat(40) + '\n';
  summary += '✅ Successfully sent: ' + successCount + '\n';
  summary += '❌ Failed: ' + failureCount + '\n';
  summary += '━'.repeat(40) + '\n\n';
  
  // --- Step 3: Add detailed results ---
  results.forEach(function(result) {
    summary += result + '\n';
  });
  
  // --- Step 4: Show results in a dialog ---
  SpreadsheetApp.getUi()
    .createAlertDialog()
    .setTitle('Email Sending Results')
    .setDescription(summary)
    .setButtonSet(SpreadsheetApp.getUi().ButtonSet.OK)
    .showModalDialog();
}

/**
 * addCustomMenu
 * =============
 * Creates a custom menu in the Google Sheet.
 * This makes it easy for users to trigger the script.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 Email Tools')
    .addItem('Send Bulk Emails', 'sendBulkEmails')
    .addSeparator()
    .addItem('Preview Email (First Customer)', 'previewFirstEmail')
    .addItem('Show Customer Count', 'showCustomerCount')
    .addSeparator()
    .addItem('Add Dummy Data', 'testWithDummyData')
    .addItem('Clear All Data', 'clearAllData')
    .addToUi();
}

/**
 * previewFirstEmail
 * =================
 * Shows a preview of what the first customer's email would look like.
 * This is useful for testing before sending.
 */
function previewFirstEmail() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert('No customer data found.');
    return;
  }
  
  var headers = data[0];
  var firstRow = data[1];
  
  var customer = {
    name: firstRow[0],
    email: firstRow[1],
    balance: firstRow[2],
    lastPurchase: firstRow[3],
    tier: firstRow[4]
  };
  
  var email = generateEmail(customer);
  var preview = '📧 EMAIL PREVIEW\n';
  preview += '━'.repeat(40) + '\n\n';
  preview += 'To: ' + customer.email + '\n';
  preview += 'Subject: ' + email.subject + '\n';
  preview += '━'.repeat(40) + '\n\n';
  preview += email.body;
  
  SpreadsheetApp.getUi()
    .createAlertDialog()
    .setTitle('Email Preview')
    .setDescription(preview)
    .setButtonSet(SpreadsheetApp.getUi().ButtonSet.OK)
    .showModalDialog();
}

/**
 * showCustomerCount
 * =================
 * Displays how many customers are in the sheet.
 */
function showCustomerCount() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var customerCount = data.length - 1; // Subtract header row
  
  SpreadsheetApp.getUi().alert('📊 Customer Count: ' + customerCount);
}

/**
 * testWithDummyData
 * =================
 * Creates dummy data for testing if you don't have real data yet.
 */
function testWithDummyData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  
  // Add headers
  sheet.getRange(1, 1, 1, 5).setValues([['Name', 'Email', 'Balance', 'LastPurchase', 'Tier']]);
  
  // Add dummy data
  var dummyData = [
    ['John Smith', 'john@example.com', 2450, '2024-01-15', 'Gold'],
    ['Sarah Jones', 'sarah@example.com', 850, '2024-01-20', 'Silver'],
    ['Michael Brown', 'michael@example.com', 12300, '2023-12-01', 'Platinum'],
    ['Emily Davis', 'emily@example.com', 3200, '2024-02-01', 'Gold'],
    ['David Wilson', 'david@example.com', 150, '2023-11-15', 'Bronze'],
    ['Lisa Thompson', 'lisa@example.com', 5800, '2024-01-28', 'Platinum'],
    ['James Anderson', 'james@example.com', 1200, '2023-10-20', 'Silver'],
    ['Maria Garcia', 'maria@example.com', 920, '2024-02-05', 'Gold'],
    ['Robert Chen', 'robert@example.com', 4300, '2024-01-10', 'Platinum'],
    ['Patricia Brown', 'patricia@example.com', 340, '2023-09-01', 'Bronze']
  ];
  
  sheet.getRange(2, 1, dummyData.length, 5).setValues(dummyData);
  
  SpreadsheetApp.getUi().alert('✅ Dummy data added!');
}

/**
 * clearAllData
 * ============
 * Clears all data from the sheet (safety function).
 */
function clearAllData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('⚠️ Warning', 'This will delete ALL data in the current sheet. Are you sure?', ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSheet();
    sheet.clear();
    ui.alert('✅ Data cleared successfully.');
  }
}

/**
 * =====================================================
 * WEB APP FUNCTIONS
 * =====================================================
 * These functions are called from the EmailSender.html
 * web app interface.
 */

/**
 * getCustomerCountWebApp
 * ======================
 * Returns the number of customers in the sheet.
 * Called from the web app.
 */
function getCustomerCountWebApp() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  return data.length - 1; // Subtract header row
}

/**
 * sendBulkEmailsWebApp
 * ====================
 * Sends bulk emails and returns results as an array.
 * Called from the web app.
 */
function sendBulkEmailsWebApp() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  
  var results = [];
  
  // Loop through each customer
  data.forEach(function(row, index) {
    var customer = {
      name: row[0],
      email: row[1],
      balance: row[2],
      lastPurchase: row[3],
      tier: row[4],
      rowNumber: index + 2
    };
    
    // Validation checks
    if (!customer.email || customer.email === '') {
      results.push('❌ Row ' + customer.rowNumber + ': Skipped (no email)');
      return;
    }
    
    if (!customer.name || customer.name === '') {
      results.push('❌ Row ' + customer.rowNumber + ': Skipped (no name)');
      return;
    }
    
    // Generate and send email
    var emailContent = generateEmail(customer);
    
    try {
      GmailApp.sendEmail(
        customer.email,
        emailContent.subject,
        emailContent.body
      );
      results.push('✅ Row ' + customer.rowNumber + ': Email sent to ' + customer.name);
    } catch (error) {
      results.push('❌ Row ' + customer.rowNumber + ': Error - ' + error.message);
    }
  });
  
  return results;
}

/**
 * previewFirstEmailWebApp
 * =======================
 * Returns a preview of the first customer's email.
 * Called from the web app.
 */
function previewFirstEmailWebApp() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return 'No customer data found.';
  }
  
  var firstRow = data[1];
  var customer = {
    name: firstRow[0],
    email: firstRow[1],
    balance: firstRow[2],
    lastPurchase: firstRow[3],
    tier: firstRow[4]
  };
  
  var email = generateEmail(customer);
  var preview = '📧 EMAIL PREVIEW\n';
  preview += '━'.repeat(42) + '\n\n';
  preview += 'To: ' + customer.email + '\n';
  preview += 'Subject: ' + email.subject + '\n';
  preview += '━'.repeat(42) + '\n\n';
  preview += email.body;
  
  return preview;
}

/**
 * getColumnHeaders
 * ================
 * Returns the column headers from the sheet.
 * Useful for the web app to show data structure.
 */
function getColumnHeaders() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, 5).getValues()[0];
  return headers;
}

// =====================================================
// END OF CODE.GS
// =====================================================
