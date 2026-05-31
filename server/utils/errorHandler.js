/*
 * Centralized error handler
 */

export function errorHandler(res, error) {
  console.error("\x1b[31m[ERROR]\x1b[0m", error.message);
  console.error(error.stack);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  res.end(
    JSON.stringify({
      error: message,
      status: statusCode,
    })
  );
}
