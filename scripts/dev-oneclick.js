const { spawn } = require("child_process");
const killPort = require("kill-port");

const PORTS = [3000, 3001, 3002];

async function cleanPorts() {
  console.log("🧹 Cleaning ports...");
  for (const port of PORTS) {
    try {
      await killPort(port);
    } catch {}
  }
}

async function start() {
  await cleanPorts();

  let port = 3000;

  console.log(`🚀 Starting Next.js on port ${port}...`);

const child = spawn("npx", ["next", "dev", "--webpack", "-p", port], {
  stdio: "inherit",
  shell: true,
});

  child.on("exit", () => {
    console.log("⚠️ Server stopped");
  });
}

start();