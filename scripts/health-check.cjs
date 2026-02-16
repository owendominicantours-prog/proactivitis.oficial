#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const run = (command, args) => {
  const label = `${command} ${args.join(" ")}`.trim();
  console.log(`\n[health-check] Running: ${label}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (result.status !== 0) {
    console.error(`[health-check] Failed: ${label}`);
    process.exit(result.status || 1);
  }
};

const withNpm = (...args) => run("npm", args);

withNpm("run", "test", "--", "--runInBand");
withNpm("run", "lint:ci");
withNpm("run", "vercel-build");

if (process.env.RUN_E2E === "1") {
  withNpm("run", "test:e2e");
} else {
  console.log("[health-check] Skipping e2e. Set RUN_E2E=1 to include Playwright checks.");
}

console.log("\n[health-check] OK");

