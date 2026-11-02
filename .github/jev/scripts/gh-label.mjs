#!/usr/bin/env node
// Label a GitHub pull request or issue with Jev's triage answers.
//   node scripts/gh-label.mjs pr 12 [--repo owner/name] [--dry-run]
//   node scripts/gh-label.mjs issue 7
// Needs the GitHub CLI (gh) signed in, plus a Jev key (see README).
// Only answers Jev is sure about become labels; the rest are left for a person.

import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveBackend, systemOne } from "../src/client.mjs";
import { summarize } from "../src/summarize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { values: opts, positionals: [kind, number] } = parseArgs({
  allowPositionals: true,
  options: { repo: { type: "string" }, "dry-run": { type: "boolean", default: false } },
});
if (!["pr", "issue"].includes(kind) || !number) {
  console.error("usage: gh-label.mjs <pr|issue> <number> [--repo owner/name] [--dry-run]");
  process.exit(1);
}

const repoArgs = opts.repo ? ["--repo", opts.repo] : [];
const gh = (...args) => execFileSync("gh", [...args, ...repoArgs], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const cfg = resolveBackend();
if (!cfg) {
  console.log("No Jev key configured; skipping triage.");
  process.exit(0);
}

let state, preset, labelsFor;
if (kind === "pr") {
  const pr = JSON.parse(gh("pr", "view", number, "--json", "title,body,files"));
  const diff = gh("pr", "diff", number);
  state = {
    title: pr.title,
    body: pr.body || "",
    files: pr.files.map((f) => `${f.path} (+${f.additions}/-${f.deletions})`),
    diff: diff.length > 60000 ? `${diff.slice(0, 60000)}\n[...diff truncated]` : diff,
  };
  preset = "pr-triage";
  labelsFor = (a) => [
    a.kind.sure && `kind:${a.kind.verdict}`,
    `size:${["tiny", "small", "medium", "large"][a.size.level]}`,
    a.risk.level === 2 && a.risk.sure && "risk:high",
    a.missing_tests.verdict === "yes" && "needs-tests",
    a.docs_needed.verdict === "yes" && "needs-docs",
  ];
} else {
  const issue = JSON.parse(gh("issue", "view", number, "--json", "title,body"));
  state = { title: issue.title, body: issue.body || "" };
  preset = "issue-triage";
  labelsFor = (a) => [
    a.kind.sure && `kind:${a.kind.verdict}`,
    a.priority.level === 2 && a.priority.sure && "priority:high",
    a.needs_info.verdict === "yes" && "needs-info",
  ];
}

const { questions } = JSON.parse(readFileSync(join(ROOT, "presets", `${preset}.json`), "utf8"));
const result = await systemOne(cfg, { state, questions });
const answers = summarize(result);
const labels = labelsFor(answers).filter(Boolean);
console.log(JSON.stringify({ answers, labels, latency_ms: result.latency_ms }, null, 2));

if (opts["dry-run"] || !labels.length) process.exit(0);
for (const label of labels) {
  // --force makes this idempotent: it creates the label or leaves it as is.
  gh("label", "create", label, "--color", "ededed", "--description", "Added by Jev triage", "--force");
}
gh(kind, "edit", number, "--add-label", labels.join(","));
