const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const { resolve } = require("path");

const env = readFileSync(resolve(__dirname, ".env"), "utf-8");
const match = env.match(/^API_URL=(.+)$/m);

if (!match) {
  console.error("API_URL not found in .env");
  process.exit(1);
}

const apiUrl = match[1].replace(/["']/g, "").trim();

execSync(`npx openapi-typescript ${apiUrl}/openapi.json -o src/api/types.ts`, {
  stdio: "inherit",
});
