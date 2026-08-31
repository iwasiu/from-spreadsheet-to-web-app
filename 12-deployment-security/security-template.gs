/**
 * =====================================================
 * SECURITY BEST PRACTICES TEMPLATE
 * 
 * Use this template to secure your applications.
 * 
 * CONTENTS:
 * - User authentication
 * - Data validation
 * - API security
 * - Logging
 * - Backup
 * =====================================================
 */

/**
 * =====================================================
 * USER AUTHENTICATION
 * =====================================================
 */

function isAuthorized() {
  var user = Session.getActiveUser().getEmail();
  var authorizedUsers = [
    'admin@company.com',
    'manager@company.com'
  ];
  return authorizedUsers.includes(user);
}

function secureFunction() {
  if (!isAuthorized()) {
    throw new Error('You are not authorized to perform this action.');
  }
  // Your function logic here
}

/**
 * =====================================================
 * DATA VALIDATION
 * =====================================================
 */

function validateEmail(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  var regex = /^[\d\-+() ]+$/;
  return regex.test(phone) && phone.length >= 10;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>"]/g, '');
}

/**
 * =====================================================
 * API SECURITY
 * =====================================================
 */

function secureAPI(apiKey) {
  var validKeys = ['ABC123XYZ', 'DEF456UVW'];
  return validKeys.includes(apiKey);
}

function apiGetData(apiKey) {
  if (!secureAPI(apiKey)) {
    return { error: 'Invalid API key' };
  }
  // Return data
  return { data: 'secure_data_here' };
}

/**
 * =====================================================
 * LOGGING
 * =====================================================
 */

function logEvent(eventType, message, data) {
  var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
  if (!logSheet) {
    logSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Logs');
    logSheet.appendRow(['Timestamp', 'Event Type', 'Message', 'Data']);
  }
  logSheet.appendRow([
    new Date().toISOString(),
    eventType,
    message,
    JSON.stringify(data)
  ]);
}

function logError(error, context) {
  logEvent('ERROR', error.message, {
    stack: error.stack,
    context: context
  });
}

function logAction(user, action, details) {
  logEvent('ACTION', action, {
    user: user,
    details: details
  });
}

/**
 * =====================================================
 * BACKUP
 * =====================================================
 */

function backupData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var backupFolderId = 'YOUR_FOLDER_ID_HERE';
  var backupFolder = DriveApp.getFolderById(backupFolderId);
  var backupFile = ss.copy(ss.getName() + ' - Backup ' + new Date().toISOString());
  backupFolder.addFile(backupFile);
  DriveApp.getRootFolder().removeFile(backupFile);
}

function setupBackupTrigger() {
  ScriptApp.newTrigger('backupData')
    .timeBased()
    .everyDays(1)
    .atHour(2) // 2 AM
    .create();
}

/**
 * =====================================================
 * PERFORMANCE MONITORING
 * =====================================================
 */

function measurePerformance(func, funcName) {
  var start = new Date().getTime();
  var result = func();
  var end = new Date().getTime();
  var duration = end - start;
  logEvent('PERFORMANCE', funcName, {
    duration: duration + 'ms',
    timestamp: new Date().toISOString()
  });
  return result;
}

function trackUsage(user, action) {
  var usageSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usage');
  if (!usageSheet) {
    usageSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Usage');
    usageSheet.appendRow(['Timestamp', 'User', 'Action']);
  }
  usageSheet.appendRow([
    new Date().toISOString(),
    user,
    action
  ]);
}

// =====================================================
// END OF SECURITY TEMPLATE
// =====================================================
