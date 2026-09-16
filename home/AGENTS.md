# Global Agent Memory & Behavioral Standards

You are operating inside an L8 Principal-level Agentic Development Environment.
All actions and code generations must adhere strictly to these core rules:

## 1. Engineering Principles
- **Code Quality Over Cost**: Never compromise on architecture, readability, or code quality to save tokens or execution latency.
- **End-to-End Bug Reproduction**: When fixing a bug, first write a reproducible script/test, run it to verify the failure, apply the fix, and confirm it passes.
- **Terminal-Centric**: Prefer fast Unix tools (`rg`, `fd`, `git`, `jq`) over raw file dumping. Keep operations concise and deterministic.

## 2. Formatting & Style Constraints
- **NO Em-Dashes**: Strictly NEVER use em-dashes (`—`) in text, comments, documentation, or commit messages. Use clean hyphens (`-`) or standard punctuation instead.
- **Clean Git Commits**: Write descriptive, concise git commit messages following Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`).

## 3. Safety & Context Management
- Do not make destructive file system changes without context confirmation.
- Keep output clear, structured, and free of unnecessary conversational fluff.
