# CLAUDE.md — Session Instructions

## Read First, Every Session

1. Read `ProjectOps/PLAYBOOK.md` — full autonomous workflow
2. Read `ProjectOps/CONVENTIONS.md` — stack, auth, commands, project context
3. Run repo inspection (`git status`, `git log --oneline -5`, `git branch -a`, `gh pr list`)
4. Wait for a feature request or user signal

## How to Run

```bash
npm run dev      # development server
npm run build    # production build
npm run lint     # ESLint
npm test         # Vitest unit tests
```

## Key Files

| File | Purpose |
|------|---------|
| [ProjectOps/PLAYBOOK.md](ProjectOps/PLAYBOOK.md) | Autonomous workflow — full pipeline |
| [ProjectOps/CONVENTIONS.md](ProjectOps/CONVENTIONS.md) | Stack, auth, git identity, project context |
| [ProjectOps/QUALITY_GATES.md](ProjectOps/QUALITY_GATES.md) | Quality gate commands |
| [ProjectOps/GITHUB_SETUP.md](ProjectOps/GITHUB_SETUP.md) | Remote + auth setup reference |

## Conventions

- Commit style: Conventional Commits (`feat:`, `fix:`, `chore:`, `fix(review):`)
- Branching: `feature/<slug>`, `fix/<slug>`, `chore/<slug>`
- No AI authorship markers in commits
- No tokens or secrets in shell commands or committed files
- Always ask before deleting branches or files
