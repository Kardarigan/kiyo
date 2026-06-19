/*
 * standardized API response helpers
 */

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, message, statusCode = 400) {
  sendJSON(res, { error: message, status: statusCode }, statusCode);
}

function sendSuccess(res, data, message = "OK") {
  sendJSON(res, { success: true, message, data });
}

module.exports = { sendJSON, sendError, sendSuccess };
