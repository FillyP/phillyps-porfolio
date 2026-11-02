// Minimal client for TypeSafe's System One API (Jev).
// The same request/response shape works on three backends; only the base URL,
// key and model id change.

import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const BACKENDS = {
  typesafe: {
    keyVar: "TYPESAFE_API_KEY",
    baseUrl: "https://api.typesafe.ai",
    model: "jev-latest",
  },
  vercel: {
    keyVar: "AI_GATEWAY_API_KEY",
    baseUrl: "https://ai-gateway.vercel.sh/typesafe",
    model: "typesafe-ai/jev",
  },
  openrouter: {
    keyVar: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api",
    model: "~typesafe/jev-latest",
  },
};

// Keys can live in the environment or in ~/.jev/env (KEY=VALUE lines), so a key
// added mid-session works without restarting T3 Code.
export function loadEnvFile(path = process.env.JEV_ENV_FILE || join(homedir(), ".jev", "env")) {
  const vars = {};
  if (!existsSync(path)) return vars;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) vars[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return vars;
}

export function resolveBackend({ backend, model, env = process.env, fileEnv = loadEnvFile() } = {}) {
  const get = (name) => env[name] || fileEnv[name];
  const name = backend || get("JEV_BACKEND") || Object.keys(BACKENDS).find((b) => get(BACKENDS[b].keyVar));
  if (!name) return null;
  const spec = BACKENDS[name];
  if (!spec) throw new Error(`Unknown backend "${name}". Use one of: ${Object.keys(BACKENDS).join(", ")}`);
  const apiKey = get(spec.keyVar);
  if (!apiKey) return null;
  return {
    name,
    apiKey,
    baseUrl: (get("JEV_BASE_URL") || spec.baseUrl).replace(/\/$/, ""),
    model: model || get("JEV_MODEL") || spec.model,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function systemOne(cfg, { state, questions }, { retries = 3, timeoutMs = 30000, fetchImpl = fetch } = {}) {
  const body = JSON.stringify({ model: cfg.model, state, questions });
  for (let attempt = 0; ; attempt++) {
    const started = performance.now();
    const res = await fetchImpl(`${cfg.baseUrl}/v1/systemone`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const latencyMs = Math.round(performance.now() - started);
    // 429 = rate limited, 529 = TypeSafe overloaded; both are retryable.
    if ((res.status === 429 || res.status === 529 || res.status >= 500) && attempt < retries) {
      await sleep(250 * 2 ** attempt);
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`Jev request failed (${res.status}): ${text.slice(0, 500)}`);
    return { ...JSON.parse(text), latency_ms: latencyMs };
  }
}

export async function listModels(cfg, { fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`${cfg.baseUrl}/v1/models`, {
    headers: { Authorization: `Bearer ${cfg.apiKey}` },
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Listing models failed (${res.status}): ${text.slice(0, 500)}`);
  return JSON.parse(text);
}
