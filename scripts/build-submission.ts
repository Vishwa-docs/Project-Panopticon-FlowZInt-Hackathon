import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const submissionRoot = path.join(root, "submission");
const codeRoot = path.join(submissionRoot, "code");

const excluded = new Set([
  "node_modules",
  ".next",
  "coverage",
  ".git",
  "submission",
  "dist",
  "out",
  ".env"
]);

const excludedFiles = new Set(["data/vector-index.json", "submission/submission.pdf", "tsconfig.tsbuildinfo"]);

function copyDir(source: string, destination: string) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    const relativePath = path.relative(root, sourcePath);
    if (excludedFiles.has(relativePath)) continue;
    if (entry.isDirectory()) {
      copyDir(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

fs.rmSync(codeRoot, { recursive: true, force: true });
copyDir(root, codeRoot);
console.log(`Submission source copied to ${codeRoot}`);
