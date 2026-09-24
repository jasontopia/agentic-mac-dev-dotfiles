# Project notes for agents

Deliberate decisions in this repo - do NOT silently revert them:

- `homebrew.onActivation.cleanup = "zap"` in `configuration.nix` is intentional. It forces the good habit of declaring every Homebrew package in the Nix config instead of installing things ad-hoc, which keeps the machine reproducible. Do not soften it to `uninstall` or `none`. Users are warned about its effect in README.md; this note is for anyone tempted to change the setting itself.
- Global git config is split across two files and only one is in this repo: `home/.config/git/config` (linked to `~/.config/git/config`) holds non-identity settings, while `~/.gitconfig` holds identity and is deliberately unmanaged. Git reads the repo's file first, so anything `~/.gitconfig` repeats silently wins. If a git setting from this repo is not taking effect, check `git config --show-origin` before changing the repo - the fix is usually to unset the duplicate in `~/.gitconfig`, not to edit here.
- `~/.codex/config.toml` is deliberately not declared. It is written by the ChatGPT app and pins that app's own version inside itself, so tracking it would hard-pin one version and churn on every app update. Do not "complete" the Codex config to match Claude's and Pi's; README's 注意事项 explains it.
- This repo is public and `main` has no protection, so any push publishes. Never commit credentials or `.env` contents, and do not add new machine-specific state to it. The one tracked machine profile is the `autoMode.environment` block in `home/.claude/settings.json`, which stays there on purpose: Claude Code resolves `autoMode` only in user or managed scope, so moving it to `settings.local.json` would silently disable it. Re-read that block when it changes and keep it to posture statements - no credentials, tokens, or private hostnames. Never commit `.no-mistakes/` validation evidence either; it is gitignored, but if a validation pipeline stages evidence into a branch, drop it before merging.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
