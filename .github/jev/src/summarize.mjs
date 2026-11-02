// Turns Jev's raw answers into short verdicts an agent or script can act on.
// Jev makes the judgment; these bands decide what counts as a usable answer.
// Bands follow TypeSafe's guidance: treat a noul as yes above ~0.7, no below
// ~0.3, and the middle as its own "unsure" case.

export const DEFAULTS = { yesAt: 0.7, noAt: 0.3, sureAt: 0.8 };

export function summarizeAnswer(answer, opts = {}) {
  const { yesAt, noAt, sureAt } = { ...DEFAULTS, ...opts };
  switch (answer.type) {
    case "noul": {
      const p = answer.noul;
      const verdict = p >= yesAt ? "yes" : p <= noAt ? "no" : "unsure";
      return { verdict, p: round(p), sure: verdict !== "unsure" };
    }
    case "choice": {
      const ranked = Object.entries(answer.probabilities || {}).sort((a, b) => b[1] - a[1]);
      const p = ranked[0]?.[1] ?? null;
      return {
        verdict: answer.choice,
        p: round(p),
        runner_up: ranked[1] ? `${ranked[1][0]} (${round(ranked[1][1])})` : null,
        confidence: round(answer.confidence),
        sure: p !== null && p >= sureAt,
      };
    }
    case "score": {
      const level = Math.round(answer.score);
      const label = answer.legend?.[level] ?? answer.legend?.[String(level)] ?? null;
      return {
        verdict: label ?? level,
        score: round(answer.score),
        level,
        confidence: round(answer.confidence),
        sure: (answer.probabilities?.[level] ?? answer.probabilities?.[String(level)] ?? 0) >= sureAt,
      };
    }
    default:
      return { verdict: answer[answer.type] ?? null, sure: false };
  }
}

export function summarize(result, opts) {
  const out = {};
  for (const [id, answer] of Object.entries(result.answers || {})) out[id] = summarizeAnswer(answer, opts);
  return out;
}

const round = (n) => (typeof n === "number" ? Math.round(n * 1000) / 1000 : n);
