# Jev triage (installed copy)

These files label this repo's new pull requests and issues with Jev, through
`.github/workflows/jev-triage.yml`. They come from `FillyP/jev` at 0dd57f5.
Don't edit them here: change them in `FillyP/jev` and run
`node scripts/install-triage.mjs <this-repo-folder>` there.

Needs the repository secret `AI_GATEWAY_API_KEY` (or `TYPESAFE_API_KEY` /
`OPENROUTER_API_KEY`). Without it the job skips quietly.
