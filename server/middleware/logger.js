/*
 * Request logger middleware
 * Logs timestamp, method, URL, status, and response time
 */
export function logger(req) {
  const start = Date.now();
  const { method, url } = req;

  // Log request start
  console.log(`[${new Date().toISOString()}] → ${method} ${url}`);

  // Hook into repsonse finish to log status
  const originalEnd = req.socket?.end;
  req.on("end", () => {
    const duration = Date.now() - start;
    const status = req.res?.status || 200;
    const statusColor = status < 400 ? "\x1b[32m" : "\x1b[31m";
    console.log(
      `${statusColor}[${new Date().toISOString()}] ← ${method} ${url} ${status} ${duration}ms\x1b[0m]`
    );
  });
}
