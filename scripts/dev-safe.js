const { spawn } = require("child_process");

const PORT = 3000;

console.log("🚀 Starting Next.js dev server...");

const child = spawn("npx", ["next", "dev", "-p", PORT], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  console.log("⚠️ Server stopped");
  process.exit(code);
});