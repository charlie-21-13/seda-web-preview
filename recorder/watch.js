const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rootDir = path.resolve(__dirname, "..");
const workspaceDir = path.join(rootDir, "workspace");
const logsDir = path.join(rootDir, "logs");
const logFile = path.join(logsDir, "work-events.jsonl");

const ignoredNames = new Set([
  ".DS_Store",
  ".git",
  "node_modules",
  ".cache",
  "dist",
  "build",
  "logs",
  "recorder"
]);

const ignoredExtensions = new Set([
  ".tmp",
  ".temp",
  ".log",
  ".swp"
]);

const debounceMs = 800;
const pending = new Map();
const hashes = new Map();

function ensureDirs() {
  fs.mkdirSync(workspaceDir, { recursive: true });
  fs.mkdirSync(logsDir, { recursive: true });
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, "", "utf8");
  }
}

function readLastSeq() {
  if (!fs.existsSync(logFile)) return 0;
  const lines = fs.readFileSync(logFile, "utf8").trim().split("\n").filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    try {
      const event = JSON.parse(lines[i]);
      if (Number.isInteger(event.seq)) return event.seq;
    } catch (_) {
      // Ignore malformed manual edits; evaluator can inspect the raw file later.
    }
  }
  return 0;
}

let seq = readLastSeq();

function shouldIgnore(filePath) {
  const relative = path.relative(rootDir, filePath);
  if (!relative || relative.startsWith("..")) return true;

  const parts = relative.split(path.sep);
  if (parts.some((part) => ignoredNames.has(part))) return true;
  if (ignoredExtensions.has(path.extname(filePath))) return true;

  return false;
}

function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function countLines(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    return text.length === 0 ? 0 : text.split(/\r?\n/).length;
  } catch (_) {
    return null;
  }
}

function areaFor(relativePath) {
  if (relativePath.startsWith("workspace/design/")) return "design";
  if (relativePath.startsWith("workspace/handoff/")) return "handoff";
  if (relativePath.startsWith("workspace/submission/")) return "submission";
  if (relativePath.startsWith("workspace/assets/")) return "assets";
  if (relativePath.startsWith("workspace/")) return "workspace";
  if (relativePath.startsWith("brief/")) return "brief";
  if (relativePath.startsWith("submission/")) return "submission";
  return "root";
}

function summaryFor(relativePath, eventType) {
  const area = areaFor(relativePath);
  const fileName = path.basename(relativePath);

  if (eventType === "deleted") {
    return `${area} 작업 파일 삭제: ${fileName}`;
  }

  if (eventType === "created") {
    return `${area} 작업 파일 생성: ${fileName}`;
  }

  return `${area} 작업 파일 수정: ${fileName}`;
}

function appendEvent(event) {
  seq += 1;
  const payload = { seq, ...event };
  fs.appendFileSync(logFile, `${JSON.stringify(payload)}\n`, "utf8");
  process.stdout.write(`[recorded #${seq}] ${payload.summary}\n`);
}

function recordPath(filePath) {
  if (shouldIgnore(filePath)) return;

  const relativePath = path.relative(rootDir, filePath);
  const exists = fs.existsSync(filePath);
  const previousHash = hashes.get(relativePath);

  if (!exists) {
    if (previousHash) {
      hashes.delete(relativePath);
      appendEvent({
        event: "file_change",
        change: "deleted",
        path: relativePath,
        area: areaFor(relativePath),
        summary: summaryFor(relativePath, "deleted")
      });
    }
    return;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    watchDirectory(filePath);
    return;
  }

  const nextHash = hashFile(filePath);
  if (previousHash === nextHash) return;

  const change = previousHash ? "modified" : "created";
  hashes.set(relativePath, nextHash);

  appendEvent({
    event: "file_change",
    change,
    path: relativePath,
    area: areaFor(relativePath),
    bytes: stat.size,
    lines: countLines(filePath),
    summary: summaryFor(relativePath, change)
  });
}

function queuePath(filePath) {
  clearTimeout(pending.get(filePath));
  pending.set(filePath, setTimeout(() => {
    pending.delete(filePath);
    try {
      recordPath(filePath);
    } catch (error) {
      process.stderr.write(`[recorder warning] ${error.message}\n`);
    }
  }, debounceMs));
}

const watchedDirs = new Set();

function watchDirectory(dirPath) {
  if (watchedDirs.has(dirPath) || shouldIgnore(dirPath)) return;
  if (!fs.existsSync(dirPath)) return;

  watchedDirs.add(dirPath);

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (shouldIgnore(entryPath)) continue;
    if (entry.isDirectory()) {
      watchDirectory(entryPath);
    } else {
      try {
        hashes.set(path.relative(rootDir, entryPath), hashFile(entryPath));
      } catch (_) {
        // File may disappear during startup scan.
      }
    }
  }

  fs.watch(dirPath, (eventType, fileName) => {
    if (!fileName) return;
    queuePath(path.join(dirPath, fileName.toString()));
  });
}

ensureDirs();
watchDirectory(rootDir);

appendEvent({
  event: "recorder_start",
  summary: "작업 기록 시작"
});

process.stdout.write("\nWork recorder is running.\n");
process.stdout.write("Keep this terminal open while working on the assignment.\n");
process.stdout.write(`Logs are saved to ${path.relative(rootDir, logFile)}.\n\n`);

process.on("SIGINT", () => {
  appendEvent({
    event: "recorder_stop",
    summary: "작업 기록 종료"
  });
  process.exit(0);
});
