# Engineering Workflow

## Feature Pipeline (Every Feature)

1. **PLAN** — Understand requirement → produce ≤20-line plan + file impact list → STOP (wait for approval)
2. **Branch** — `git checkout -b feature/<short-slug>`
3. **Implement** — Minimal code changes only; no scope creep
4. **Test** — Add/update tests covering the change
5. **Quality Gates** — Run tests + lint + format + build locally
6. **Docs** — Update relevant docs/changelog when behavior changes
7. **Commit** — Clean conventional commit messages (see below)
8. **Push** — `git push -u origin feature/<slug>`
9. **PR** — Open pull request; describe what/why
10. **Review Loop** — Fix review comments → commit → push → update PR → repeat until approved

## Stop Points

| # | Trigger | Action |
|---|---------|--------|
| 1 | After presenting PLAN | Wait for "approved" or corrections |
| 2 | Tests/lint/build fail requiring approach change | Stop and discuss |
| 3 | Before merging to main | Wait for "merge" signal |

## Branching Convention

```
main          ← stable, protected
feature/<slug>  ← one branch per feature
fix/<slug>      ← bug fixes
chore/<slug>    ← maintenance, deps, tooling
```

## Commit Message Style (Conventional Commits)

```
<type>(<scope>): <short description>

Types: feat, fix, chore, docs, test, refactor, style, ci
Example: feat(auth): add JWT token refresh endpoint
```

## Definition of Done

- [ ] All tests pass
- [ ] Lint/format clean
- [ ] Build succeeds (if applicable)
- [ ] PR opened with description
- [ ] No regressions in existing tests
- [ ] Docs updated if behavior changed

## Autonomy Rules

- Claude runs all routine commands autonomously (git, test, lint, build)
- Claude asks at most ONE clarification when requirements are ambiguous
- Conversation stays minimal and execution-focused
