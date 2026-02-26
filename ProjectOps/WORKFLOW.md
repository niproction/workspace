# Workflow Index

> The full autonomous workflow is in PLAYBOOK.md.
> This file is kept for reference only.

## Quick Reference

| Document | Purpose |
|----------|---------|
| [PLAYBOOK.md](PLAYBOOK.md) | Full end-to-end autonomous workflow (read every session) |
| [CONVENTIONS.md](CONVENTIONS.md) | Project-specific stack, auth, commands, context |
| [QUALITY_GATES.md](QUALITY_GATES.md) | Lint / build / test commands |
| [GITHUB_SETUP.md](GITHUB_SETUP.md) | One-time remote + auth setup |

## Stop Points (summary)

1. After PLAN — wait for `"Proceed"`
2. After PR opened — wait for `"Check review"` or `"Approved – merge"`
3. After review summary — wait for `"Proceed with implementation"`
4. After fix push — wait for `"Approved – merge"`
5. After merge — wait for next feature request
