#!/usr/bin/env node
// Kill a process listening on a specific TCP port (macOS/Linux)
// Usage: node scripts/kill-port.js 3000

const { execSync } = require('child_process')

function usage() {
  console.log('Usage: node scripts/kill-port.js <port>')
  process.exit(1)
}

const port = process.argv[2]
if (!port) usage()

try {
  // Find PIDs listening on the port
  const out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN | awk 'NR>1 {print $2}' | uniq`, { stdio: ['ignore', 'pipe', 'pipe'] })
  const pids = out.toString().split(/\s+/).filter(Boolean)

  if (pids.length === 0) {
    console.log(`[kill-port] No process listening on port ${port}`)
    process.exit(0)
  }

  for (const pid of pids) {
    try {
      process.kill(parseInt(pid, 10))
      console.log(`[kill-port] Sent SIGTERM to PID ${pid} on port ${port}`)
    } catch {
      try {
        process.kill(parseInt(pid, 10), 'SIGKILL')
        console.log(`[kill-port] Sent SIGKILL to PID ${pid} on port ${port}`)
      } catch (e) {
        console.warn(`[kill-port] Failed to kill PID ${pid}: ${e.message}`)
      }
    }
  }
} catch (e) {
  console.warn(`[kill-port] Error while finding process on port ${port}: ${e.message}`)
}
