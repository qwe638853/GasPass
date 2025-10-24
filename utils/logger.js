import fs from 'node:fs';
import path from 'node:path';

/**
 * Logger utility for Bungee testing
 * Provides functions to log data to JSON files for debugging and analysis
 */

/**
 * Logs data to a JSON file
 * @param {any} data - The data to log
 * @param {string} filename - The filename (without extension)
 * @param {string} outputDir - The output directory
 */
export function logToJson(data, filename, outputDir) {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fullFilename = `${filename}_${timestamp}.json`;
    const filePath = path.join(outputDir, fullFilename);

    // Write data to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`📝 Logged ${filename} to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to log ${filename}:`, error.message);
  }
}

/**
 * Logs error information to a JSON file
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 * @param {string} outputDir - The output directory
 */
export function logError(error, context, outputDir) {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...(error.code && { code: error.code }),
    ...(error.shortMessage && { shortMessage: error.shortMessage })
  };

  logToJson(errorData, `error_${context}`, outputDir);
}

/**
 * Logs transaction information
 * @param {Object} txData - Transaction data
 * @param {string} txType - Type of transaction
 * @param {string} outputDir - The output directory
 */
export function logTransaction(txData, txType, outputDir) {
  const transactionLog = {
    timestamp: new Date().toISOString(),
    type: txType,
    ...txData
  };

  logToJson(transactionLog, `transaction_${txType}`, outputDir);
}

/**
 * Logs API request/response data
 * @param {Object} requestData - Request data
 * @param {Object} responseData - Response data
 * @param {string} endpoint - API endpoint
 * @param {string} outputDir - The output directory
 */
export function logApiCall(requestData, responseData, endpoint, outputDir) {
  const apiLog = {
    timestamp: new Date().toISOString(),
    endpoint,
    request: requestData,
    response: responseData
  };

  logToJson(apiLog, `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`, outputDir);
}

/**
 * Creates a summary log of the entire test run
 * @param {Object} summary - Summary data
 * @param {string} outputDir - The output directory
 */
export function logTestSummary(summary, outputDir) {
  const summaryLog = {
    timestamp: new Date().toISOString(),
    testRun: summary
  };

  logToJson(summaryLog, 'test_summary', outputDir);
}
