# Project Conventions

> This file is project-specific. Update it whenever the stack or setup changes.
> Claude reads this at the start of every session.

---

## Repository

| Key | Value |
|-----|-------|
| Remote | https://github.com/niproction/workspace |
| Default branch | `main` |
| Branch protection | PRs required, no force push |
| Visibility | Public |

## Git Identity

| Key | Value |
|-----|-------|
| user.name | niproction |
| user.email | hanouka798@gmail.com |

## GitHub CLI Auth

- Token stored in: `.gh_token` (gitignored)
- Usage pattern: `GH_TOKEN=$(cat .gh_token) gh <command>`
- Scopes required: `repo`, `workflow`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Testing | Vitest |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |
| Package manager | npm |

## Quality Gate Commands

```bash
npm run lint    # ESLint
npm run build   # Next.js production build
npm test        # Vitest (npm run test)
```

## Branching

```
main              ← stable, protected
feature/<slug>    ← new features
fix/<slug>        ← bug fixes
chore/<slug>      ← tooling, deps, config, docs
```

## Commit Style

Conventional Commits:
```
feat(<scope>): description
fix(<scope>): description
chore(<scope>): description
fix(review): description
```

## Project Context

- **Type:** Wedding website
- **Wedding date:** 08.07.2026 (July 8, 2026)
- **Timezone:** IDT (Israel Daylight Time) = UTC+3 in summer
- **Design:** Minimal, elegant, premium — no cheesy wedding clichés
- **Palette:** ivory, cream, blush, rose, sage, charcoal
- **Fonts:** Cormorant Garamond (display) + Inter (body)
