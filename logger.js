// logger.js

// Utility function to get formatted timestamp
function getTimestamp() {
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

// Utility function to handle logging with colors
function logInfo(message) {
    console.log(`\x1b[36m[INFO] ${getTimestamp()}:\x1b[0m ${message}`);
}

function logSuccess(message) {
    console.log(`\x1b[32m[SUCCESS] ${getTimestamp()}:\x1b[0m ${message}`);
}

function logWarning(message) {
    console.log(`\x1b[33m[WARNING] ${getTimestamp()}:\x1b[0m ${message}`);
}

function logError(message) {
    console.log(`\x1b[31m[ERROR] ${getTimestamp()}:\x1b[0m ${message}`);
}

// Export logging functions
module.exports = {
    logInfo,
    logSuccess,
    logWarning,
    logError
};
