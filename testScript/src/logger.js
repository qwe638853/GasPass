/**
 * Logger utility for testScript
 * Provides functions to log data to JSON files for debugging and analysis
 * Similar to Bungee test logger but adapted for browser environment
 */

/**
 * Logs data to localStorage as JSON
 * @param {any} data - The data to log
 * @param {string} filename - The filename (without extension)
 * @param {string} prefix - The prefix for localStorage key
 */
export function logToJson(data, filename, prefix = 'TESTSCRIPT_LOG') {
  try {
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFilename = `${filename}_${timestamp}.json`;
    const storageKey = `${prefix}_${fullFilename}`;
    
    // Store data in localStorage
    localStorage.setItem(storageKey, JSON.stringify(data, null, 2));
    
    console.log(`📝 Logged ${filename} to localStorage: ${storageKey}`);
    
    // Also log to console for debugging
    console.log(`📋 ${filename} data:`, data);
    
    return storageKey;
  } catch (error) {
    console.error(`❌ Failed to log ${filename}:`, error.message);
    return null;
  }
}

/**
 * Logs error information to localStorage
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 * @param {string} prefix - The prefix for localStorage key
 */
export function logError(error, context, prefix = 'TESTSCRIPT_LOG') {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...(error.code && { code: error.code }),
    ...(error.shortMessage && { shortMessage: error.shortMessage })
  };

  return logToJson(errorData, `error_${context}`, prefix);
}

/**
 * Logs API request/response data
 * @param {Object} requestData - Request data
 * @param {Object} responseData - Response data
 * @param {string} endpoint - API endpoint
 * @param {string} prefix - The prefix for localStorage key
 */
export function logApiCall(requestData, responseData, endpoint, prefix = 'TESTSCRIPT_LOG') {
  const apiLog = {
    timestamp: new Date().toISOString(),
    endpoint,
    request: requestData,
    response: responseData
  };

  return logToJson(apiLog, `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`, prefix);
}

/**
 * Logs transaction information
 * @param {Object} txData - Transaction data
 * @param {string} txType - Type of transaction
 * @param {string} prefix - The prefix for localStorage key
 */
export function logTransaction(txData, txType, prefix = 'TESTSCRIPT_LOG') {
  const transactionLog = {
    timestamp: new Date().toISOString(),
    type: txType,
    ...txData
  };

  return logToJson(transactionLog, `transaction_${txType}`, prefix);
}

/**
 * Creates a summary log of the entire test run
 * @param {Object} summary - Summary data
 * @param {string} prefix - The prefix for localStorage key
 */
export function logTestSummary(summary, prefix = 'TESTSCRIPT_LOG') {
  const summaryLog = {
    timestamp: new Date().toISOString(),
    testRun: summary
  };

  return logToJson(summaryLog, 'test_summary', prefix);
}

/**
 * Logs EIP-712 signature data
 * @param {Object} signatureData - Signature data
 * @param {string} prefix - The prefix for localStorage key
 */
export function logSignature(signatureData, prefix = 'TESTSCRIPT_LOG') {
  const signatureLog = {
    timestamp: new Date().toISOString(),
    ...signatureData
  };

  return logToJson(signatureLog, 'signature_data', prefix);
}

/**
 * Logs quote data
 * @param {Object} quoteData - Quote data
 * @param {string} prefix - The prefix for localStorage key
 */
export function logQuote(quoteData, prefix = 'TESTSCRIPT_LOG') {
  const quoteLog = {
    timestamp: new Date().toISOString(),
    ...quoteData
  };

  return logToJson(quoteLog, 'quote_data', prefix);
}

/**
 * Logs execute data
 * @param {Object} executeData - Execute data
 * @param {string} prefix - The prefix for localStorage key
 */
export function logExecute(executeData, prefix = 'TESTSCRIPT_LOG') {
  const executeLog = {
    timestamp: new Date().toISOString(),
    ...executeData
  };

  return logToJson(executeLog, 'execute_data', prefix);
}

/**
 * Logs submit data
 * @param {Object} submitData - Submit data
 * @param {string} prefix - The prefix for localStorage key
 */
export function logSubmit(submitData, prefix = 'TESTSCRIPT_LOG') {
  const submitLog = {
    timestamp: new Date().toISOString(),
    ...submitData
  };

  return logToJson(submitLog, 'submit_data', prefix);
}

/**
 * Logs status polling data
 * @param {Object} statusData - Status data
 * @param {string} prefix - The prefix for localStorage key
 */
export function logStatus(statusData, prefix = 'TESTSCRIPT_LOG') {
  const statusLog = {
    timestamp: new Date().toISOString(),
    ...statusData
  };

  return logToJson(statusLog, 'status_data', prefix);
}

/**
 * Gets all logs from localStorage
 * @param {string} prefix - The prefix for localStorage key
 * @returns {Array} Array of log entries
 */
export function getAllLogs(prefix = 'TESTSCRIPT_LOG') {
  const logs = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        logs.push({
          key,
          data,
          timestamp: data.timestamp || new Date().toISOString()
        });
      } catch (error) {
        console.warn(`Failed to parse log ${key}:`, error);
      }
    }
  }
  return logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Clears all logs from localStorage
 * @param {string} prefix - The prefix for localStorage key
 */
export function clearLogs(prefix = 'TESTSCRIPT_LOG') {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`🧹 Cleared ${keysToRemove.length} logs with prefix: ${prefix}`);
}
