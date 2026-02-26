# Claude Code — Autonomous Workflow Playbook

> Generic. Reusable. Stack-agnostic.
> Read this at the start of every session before doing anything.

---

## SESSION START — ALWAYS DO THIS FIRST

1. Read `ProjectOps/CONVENTIONS.md` — pick up project-specific settings.
2. Run repo inspection:
   - `git status` + `git log --oneline -5` + `git branch -a`
   - Check for open PRs: `gh pr list`
   - Confirm working tree is clean and on `main`
3. If a PR is already open — do NOT touch it. Wait for user signal.

---

## PHASE 0 — BOOTSTRAP (only if project has no production structure)

A project needs bootstrapping if it lacks: package manager setup, linter, test runner, CI.

Steps:
1. Initialize stack (Next.js+TS, Node, Python, etc. — per user decision)
2. Add: ESLint (or stack equivalent), test runner (vitest / jest / pytest), build script
3. Add `.github/workflows/ci.yml`: on `pull_request` → install → lint → build → test
4. Add proper `.gitignore`
5. Commit: `chore: bootstrap project`
6. Push + open PR → **STOP**

If project already has structure, skip this phase entirely.

---

## PHASE 1 — FEATURE START

When the user gives a feature:

**Present this plan and STOP:**
```
## Plan: <feature name>

**Branch:** feature/<slug>
**Files impacted:** <list>
**Acceptance criteria:**
- <criterion>
**Edge cases:** <list>
**Risks:** <list>
```

Wait for "Proceed" before writing any code.

After "Proceed":
```bash
git checkout main
git pull origin main
git checkout -b feature/<slug>
```

---

## PHASE 2 — IMPLEMENTATION STANDARDS

- Logic must be isolated and testable.
- No unnecessary dependencies.
- Accessibility where relevant (aria, keyboard nav).
- No hydration mismatches (Next.js: mark client components explicitly).
- No unnecessary re-renders.
- Timezone-safe date handling (always explicit offset or UTC).
- Components stay small and single-purpose.
- Never work directly on `main`.

---

## PHASE 3 — LOCAL QUALITY GATES (mandatory before every push)

Run in order. Fix any failure before continuing.

```bash
npm run lint     # or equivalent
npm run build    # or equivalent
npm test         # or equivalent
```

If no tests exist yet: add at least one unit test for the core logic of this feature.

If all pass → proceed to commit.
If any fail requiring an approach change → **STOP and discuss with user.**

---

## PHASE 4 — COMMIT / PUSH / PR

**Commit format (Conventional Commits):**
```
feat(<scope>): <short description>
fix(<scope>): <short description>
chore(<scope>): <short description>
fix(review): <short description>   ← for review fixes
```

Rules:
- Author = configured git user only. No AI authorship markers.
- No secrets, tokens, or `.env` files in commits.
- Never commit `.gh_token`, credentials, or API keys.

**Push:**
```bash
git push -u origin <branch>
```

**Open PR:**
```bash
GH_TOKEN=$(cat .gh_token) gh pr create \
  --title "<type>: <description>" \
  --body "..." \
  --base main \
  --head <branch>
```

PR body must include:
- Summary (what + why)
- Files changed
- Test plan (checklist)
- Manual validation results

**→ STOP. Do NOT merge.**

---

## PHASE 5 — REVIEW LOOP

Wait for user signal: **"Check review"**

On "Check review":
1. Fetch all comments:
   ```bash
   GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/pulls/<n>/reviews
   GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/pulls/<n>/comments
   ```
2. For each comment, output:
   - What it says
   - Root cause
   - Proposed fix
   - Files impacted
3. Present fix plan → **STOP. Do NOT implement yet.**

Wait for user signal: **"Proceed with implementation"** (or equivalent approval)

On approval:
1. Apply all fixes.
2. Re-run full quality gates.
3. Commit: `fix(review): <short description>`
4. Push to same branch.
5. **→ STOP again.**

Repeat until user says: **"Approved – merge"**

---

## PHASE 6 — MERGE + CLEANUP

Only on explicit **"Approved – merge"** (or "merge"):

1. Confirm CI is green:
   ```bash
   GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/commits/<sha>/check-runs \
     --jq '.check_runs[] | {name,status,conclusion}'
   ```
2. Merge (squash preferred):
   ```bash
   GH_TOKEN=$(cat .gh_token) gh pr merge <n> --squash --subject "<title>" --body ""
   ```
3. Delete branch remotely + locally:
   ```bash
   git checkout main
   git pull origin main
   git branch -D <branch>
   git push origin --delete <branch>
   ```
4. Confirm clean state: `git status` + `git branch -a`
5. **→ STOP. Wait for next feature.**

---

## SECURITY RULES (always)

| Rule | Detail |
|------|--------|
| No tokens in shell args | Use `GH_TOKEN=$(cat .gh_token)` pattern |
| No secrets in commits | Never stage `.env`, `.gh_token`, credentials |
| `.gh_token` always gitignored | Verify it's in `.gitignore` before first push |
| No AI authorship | No "Co-authored-by: Claude" or similar |
| Commits authored as git user | `git config user.name` / `user.email` must match repo owner |

---

## COMMUNICATION RULES (always)

- Explanations: short and plain language.
- Label every git action clearly before running:
  `[GIT: commit]`, `[GIT: push]`, `[GIT: merge]`, `[GIT: delete branch]`
- Ask at most ONE clarification question per ambiguity.
- Never run destructive git operations without explicit user confirmation.
- Always ask before deleting branches or files.

---

## STOP POINTS SUMMARY

| Signal from user | Claude action |
|-----------------|---------------|
| *(feature given)* | Present PLAN → STOP |
| `"Proceed"` | Start implementation |
| *(after PR opened)* | STOP — wait |
| `"Check review"` | Fetch + summarize comments → STOP |
| `"Proceed with implementation"` | Apply fixes → STOP |
| `"Approved – merge"` / `"merge"` | Merge + cleanup → STOP |
