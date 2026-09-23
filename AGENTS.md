# Project notes for agents

Deliberate decisions in this repo - do NOT silently revert them:

- `homebrew.onActivation.cleanup = "zap"` in `configuration.nix` is intentional. It forces the good habit of declaring every Homebrew package in the Nix config instead of installing things ad-hoc, which keeps the machine reproducible. Do not soften it to `uninstall` or `none`. Users are warned about its effect in README.md; this note is for anyone tempted to change the setting itself.
- Global git config is split across two files and only one is in this repo: `home/.config/git/config` (linked to `~/.config/git/config`) holds non-identity settings, while `~/.gitconfig` holds identity and is deliberately unmanaged. Git reads the repo's file first, so anything `~/.gitconfig` repeats silently wins. If a git setting from this repo is not taking effect, check `git config --show-origin` before changing the repo - the fix is usually to unset the duplicate in `~/.gitconfig`, not to edit here.
- Never commit `.no-mistakes/` validation evidence to this public repo. `.no-mistakes/` is gitignored; if a validation pipeline stages evidence into a branch, drop it before merging.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
