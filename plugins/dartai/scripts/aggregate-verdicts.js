#!/usr/bin/env node
// Reads all verdict files under .dartai/reports/<task-id>/ and writes
// .dartai/reports/<task-id>/verdict-summary.kdl
// Usage: node aggregate-verdicts.js <task-id> [reports-dir]
//
// Output KDL shape:
//   task-id "<id>"
//   gate "pass"|"fail"|"warn"
//   reviewer "<role>" verdict="pass|fail|warn" confidence="high|med|low" [blocker="<text>"] ...
//   reviewer ...

const fs = require("fs");
const path = require("path");

const ROLE_FILES = [
  "qa",
  "quality",
  "correctness",
  "maintainability",
  "testing",
  "ts-strict",
  "cli-readiness",
  "security",
];

function parseVerdictFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const lines = fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const result = { verdict: null, confidence: null, blockers: [], advisories: [] };
  for (const line of lines) {
    if (line.startsWith("verdict:")) result.verdict = line.slice(8).trim();
    else if (line.startsWith("confidence:")) result.confidence = line.slice(11).trim();
    else if (line.startsWith("blocker:")) result.blockers.push(line.slice(8).trim());
    else if (line.startsWith("advisory:")) result.advisories.push(line.slice(9).trim());
  }
  return result;
}

function kdlEscape(s) {
  return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

function main() {
  const taskId = process.argv[2];
  if (!taskId) {
    process.stderr.write("Usage: aggregate-verdicts.js <task-id> [reports-dir]\n");
    process.exit(1);
  }
  const reportsDir = process.argv[3] || ".dartai/reports";
  const dir = path.join(reportsDir, taskId);

  const rows = [];
  let gateVerdict = "pass";

  for (const role of ROLE_FILES) {
    const fp = path.join(dir, role + ".md");
    const parsed = parseVerdictFile(fp);
    if (!parsed) continue; // skipped reviewer

    const { verdict, confidence, blockers } = parsed;
    let row = `reviewer ${kdlEscape(role)} verdict=${kdlEscape(verdict)} confidence=${kdlEscape(confidence || "?")}`;
    for (const b of blockers) row += ` blocker=${kdlEscape(b)}`;
    rows.push(row);

    if (verdict === "fail") gateVerdict = "fail";
    else if (verdict === "warn" && gateVerdict === "pass") gateVerdict = "warn";
  }

  const lines = [
    `task-id ${kdlEscape(taskId)}`,
    `gate ${kdlEscape(gateVerdict)}`,
    ...rows,
  ];

  const out = lines.join("\n") + "\n";
  const summaryPath = path.join(dir, "verdict-summary.kdl");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(summaryPath, out);
  process.stdout.write(`verdict-summary: ${summaryPath}\ngate: ${gateVerdict}\n`);
}

main();
