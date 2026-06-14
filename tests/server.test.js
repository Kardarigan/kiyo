const { http } = require("http");

const BASE = process.env.PORT;

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`${BASE}${path}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, data }));
      })
      .on("error", reject);
  });
}

async function runTests() {
  console.log("Running server tests...");
  let passed = 0,
    failed = 0;

  // Test 1: Splash page
  try {
    const res = await get("/");
    if (res.status === 200 && res.data.includes("Humanity is beautiful")) {
      console.log("✓ Splash page loads");
      passed++;
    } else throw new Error("Splash content missing");
  } catch (e) {
    console.log("✗ Splash page:", e.message);
    failed++;
  }

  // Test 2: API character endpoint
  try {
    const res = await get("/api/v1/character");
    if (res.status === 200) {
      const json = JSON.parse(res.data);
      if (json.character?.name === "Korekiyo Shinguji") {
        console.log("✓ API returns character");
        passed++;
      } else throw new Error("Unexpected character data");
    } else throw new Error(`Status ${res.status}`);
  } catch (e) {
    console.log("✗ API character:", e.message);
    failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

runTests();
