# Git Workflow

After completing a task:

1. Check `git diff` and `git status`.
2. Run the relevant build, lint, typecheck, or tests.
3. If verification passes, stage the changes with `git add`.
4. Create a git commit describing the completed change.
5. Do NOT run `git push`.
6. Never commit `.env`, secrets, API keys, credentials, or generated dependencies.

Use conventional commit messages:
- feat: for new features
- fix: for bug fixes
- refactor: for refactoring
- docs: for documentation
- chore: for maintenance

Keep commits small and focused. One user request = one commit.
