# Conventions

> This file is NOT manually edited.
> It is populated automatically by Claude during session detection (DETECTION.md).
> Treat it as a read-only reference after a session starts.

---

## How Conventions Are Determined

| Convention | Source |
|-----------|--------|
| Git user / email | `git config user.name` + `git config user.email` |
| Owner / repo name | Parsed from `git remote get-url origin` |
| Default branch | `git symbolic-ref refs/remotes/origin/HEAD` or `git branch -a` |
| Stack + framework | `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, etc. |
| Package manager | Presence of `package-lock.json` (npm), `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, etc. |
| Test runner | `devDependencies` in `package.json` or test config files |
| Lint command | `scripts.lint` in `package.json` or stack default |
| Build command | `scripts.build` in `package.json` or stack default |
| Test command | `scripts.test` in `package.json` or stack default |
| CI presence | `.github/workflows/` directory |
| Token | `.gh_token` file in repo root |

---

## Commit Style

Conventional Commits — always:
```
feat(<scope>): description
fix(<scope>): description
chore(<scope>): description
fix(review): description
```

## Branching

```
<default-branch>   ← stable, protected (detected at session start)
feature/<slug>     ← new features
fix/<slug>         ← bug fixes
chore/<slug>       ← tooling, config, docs
```

## PR Merge Strategy

Squash merge — keeps default branch history clean.

## Branch Deletion

Always delete feature branches after merge — locally and remotely.
