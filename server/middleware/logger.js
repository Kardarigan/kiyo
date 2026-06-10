/*
 * Request logger middleware
 * logs timestamp, method, URL, status, and response time
 */
function logger(req, res) {
  const start = Date.now();
  const { method, url } = req;

  console.log(`[${new Date().toISOString()}] → ${method} ${url}`);

  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    const duration = Date.now() - start;
    const status = res.statusCode || 200;
    const statusColor = status < 400 ? "\x1b[32m" : "\x1b[31m";
    console.log(
      `${statusColor}[${new Date().toISOString()}] ← ${method} ${url} ${status} ${duration}ms\x1b[0m`
    );
    return originalEnd(...args);
  };
}

module.exports = { logger };
