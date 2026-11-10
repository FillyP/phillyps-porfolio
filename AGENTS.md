# Agent notes for phillyps-porfolio

Rules and facts for any coding agent (Codex reads this file directly; Claude loads it through `CLAUDE.md`). The organization and security playbook for all of Phillyp's projects lives in his private playbook repo.

## What this is

Phillyp's professional portfolio website, live at [phillyp.com](https://phillyp.com). It is a static site (plain HTML, CSS and JavaScript, no build step) served from AWS; the README describes the architecture. **This repo is public:** everything committed here, including its history, can be read by anyone.

## Commands

- Install: nothing to install.
- Run: open `index.html` in a browser.
- **Check it works:** open the pages you changed in a browser and confirm they load with no errors in the browser console (do this before every pull request).

## Workflow

- Every change goes through a pull request. Never commit to `main`.
- Start from an up-to-date `main`, on a new branch named after the task. One task per branch.
- Every pull request says what changed, why, how it was checked and how to undo it.
- The agent working on this project reviews and merges its own pull requests under the playbook's merge policy: the check above passes, a fresh-eyes review by a separate reviewer passes and is posted on the pull request, then squash and merge. Anything on its "always ask" list waits for Phillyp.
- Never force-push, rewrite history or skip hooks.
- **Save point:** before you stop, even mid-task, commit and push your branch. If the task isn't done, open or update a draft pull request ending with **Where I stopped** and **Next step**, so any agent on any machine can pick it up.

## Never

- Never read, print or commit secrets. Never ask Phillyp to paste a secret into the chat.
- Never commit personal documents (resumes, cover letters, IDs, anything with an address or phone number) or other people's personal details. The repo is public, and deleting a file later does not remove it from the history. If Phillyp wants a document published, he says so himself.
- Never change the repo's visibility, add collaborators, GitHub Actions or new tools, or change settings, without Phillyp's OK. The exceptions are the weekly routine's standard fixes and updates to the standard Jev triage (`.github/workflows/jev-triage.yml` and `.github/jev/`).
- Never run code downloaded from outside the project.

## Where to look

- Pull requests, merges, repo settings: `gh pr view`, `gh repo view`
- Unfinished work: open draft pull requests (`gh pr list --state open`), each ending with Where I stopped / Next step
- What the site is and how it is hosted: `README.md`
