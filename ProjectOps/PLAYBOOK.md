# Claude Code — Autonomous Workflow Playbook

> Generic. Reusable. Stack-agnostic. Zero manual config required.
> Read this at the start of every session before doing anything.

---

## SESSION START — ALWAYS DO THIS FIRST

Run the full detection sequence from `ProjectOps/DETECTION.md`.
Output the detection summary block. Then:

- If anything is missing (no CI, no tests, no remote, no token) → propose bootstrap plan → STOP
- If a PR is already open → do NOT touch it, wait for user signal
- If repo is clean and ready → wait for feature request

---

## PHASE 0 — BOOTSTRAP (only if detection finds missing infrastructure)

Bootstrap only what is missing. Never re-add what already exists.

| Missing | Action |
|---------|--------|
| No git init | `git init`, create `.gitignore`, initial commit |
| No remote | Ask user for repo name → create via `gh repo create` |
| No linter | Add ESLint / ruff / clippy (match stack) |
| No test runner | Add vitest / jest / pytest / cargo test (match stack) |
| No CI | Add `.github/workflows/ci.yml`: lint → build → test on `pull_request` |
| No `.gh_token` | Tell user to add it (cannot be automated — requires their credentials) |
| Branch unprotected | Enable branch protection after first push (see below) |

Commit: `chore: bootstrap project`
Push to default branch (first push only, before protection is active) → then immediately enable branch protection:

```bash
# Enable branch protection: require PRs + require CI to pass
GH_TOKEN=$(cat .gh_token) gh api \
  repos/<owner>/<repo>/branches/<default-branch>/protection \
  --method PUT \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint / Build / Test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null
}
EOF
```

> Note: `contexts` must match the job name in `ci.yml` exactly.
> After this runs, direct push to main is blocked and CI is enforced at GitHub level — not just by process.

Then open PR for bootstrap commit → **STOP**

---

## PHASE 1 — FEATURE START

When the user gives a feature, present this and STOP:

```
## Plan: <feature name>

**Branch:** <type>/<slug>
**Files impacted:** <list>
**Acceptance criteria:**
- <item>
**Edge cases:** <list>
**Risks:** <list>
```

Wait for "Proceed" (or "yes" / "approved") before writing any code.

After approval:
```bash
git checkout <default-branch>        # detected at session start
git pull origin <default-branch>
git checkout -b <type>/<slug>
```

---

## PHASE 2 — IMPLEMENTATION STANDARDS

- Logic isolated and testable.
- No unnecessary dependencies.
- Accessibility where relevant (aria labels, keyboard nav).
- No hydration mismatches (Next.js: `"use client"` where needed).
- No unnecessary re-renders.
- Timezone-safe date handling (explicit offset or UTC — never bare strings).
- Components small and single-purpose.
- Never commit directly to the default branch.

---

## PHASE 3 — LOCAL QUALITY GATES (mandatory before every push)

Use commands detected in DETECTION phase. Run in order:

```
lint → build → test
```

Rules:
- Fix every failure before continuing.
- If no tests exist for new logic → add at least one unit test first.
- If a failure requires changing the approach → **STOP and discuss.**

---

## PHASE 4 — COMMIT / PUSH / PR

**Commit format:**
```
feat(<scope>): <description>
fix(<scope>): <description>
chore(<scope>): <description>
fix(review): <description>
```

**Security:**
- Author = `git config user.name` / `user.email` — never hardcoded, never AI markers.
- Never stage: `.gh_token`, `.env`, credentials, secrets.
- Always verify `.gh_token` is in `.gitignore` before first push.

**Push + open PR:**
```bash
git push -u origin <branch>

GH_TOKEN=$(cat .gh_token) gh pr create \
  --title "<type>: <description>" \
  --body "<summary, files changed, test plan, manual validation>" \
  --base <default-branch> \
  --head <branch>
```

**→ STOP. Do NOT merge.**

---

## PHASE 5 — REVIEW LOOP

Wait for: **"Check review"**

On "Check review":
```bash
GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/pulls/<n>/reviews
GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/pulls/<n>/comments
```
(`<owner>/<repo>` detected at session start from `git remote get-url origin`)

For each comment output:
- What it says / root cause / proposed fix / files impacted

Present fix plan → **STOP. Do NOT implement yet.**

Wait for: **"Proceed with implementation"** (or equivalent)

On approval:
1. Apply fixes.
2. Re-run full quality gates.
3. Commit: `fix(review): <short>`
4. Push to same branch.
5. **→ STOP.**

Repeat until: **"Approved – merge"** or **"merge"**

---

## PHASE 6 — MERGE + CLEANUP

Only on explicit **"merge"** or **"Approved – merge"**:

1. Confirm CI green:
   ```bash
   GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/commits/<sha>/check-runs \
     --jq '.check_runs[] | {name,status,conclusion}'
   ```
   - If `status` is not `completed` → wait and recheck. Never merge while CI is running.
   - If `conclusion` is not `success` → do NOT merge. Report failure and stop.

2. Check reviews and comments (always — do not skip, do not wait for user to ask):
   ```bash
   GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/pulls/<n>/reviews
   GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/pulls/<n>/comments
   ```
   - If any unresolved comments or change-requests → summarize → **STOP. Do NOT merge.**
   - If none → proceed.

3. Merge (squash):
   ```bash
   GH_TOKEN=$(cat .gh_token) gh pr merge <n> --squash --subject "<title>" --body ""
   ```
3. Cleanup:
   ```bash
   git checkout <default-branch>
   git pull origin <default-branch>
   git branch -D <branch>
   git push origin --delete <branch>
   ```
4. Verify: `git status` + `git branch -a`
5. **→ STOP. Wait for next feature.**

---

## SECURITY RULES (always)

| Rule | Detail |
|------|--------|
| No tokens in shell args | `GH_TOKEN=$(cat .gh_token)` only |
| No secrets in commits | Never stage `.env`, `.gh_token`, credentials |
| `.gh_token` gitignored | Check before every first push on a new repo |
| No AI authorship | No "Co-authored-by: Claude" or similar |
| Git author = repo owner | Detected via `git config user.name/email` |

---

## COMMUNICATION RULES (always)

- Short, plain language.
- Label every git action before running: `[GIT: commit]`, `[GIT: push]`, `[GIT: merge]`, `[GIT: delete branch]`
- Max ONE clarification question per ambiguity.
- Always ask before deleting branches or files.
- Never run destructive operations without explicit confirmation.

---

## STOP POINTS SUMMARY

| User signal | Claude action |
|------------|---------------|
| *(session start)* | Detect → summarize → STOP |
| *(feature given)* | Present PLAN → STOP |
| `"Proceed"` / `"yes"` | Implement |
| *(after PR opened)* | STOP |
| `"Check review"` | Fetch + summarize → STOP |
| `"Proceed with implementation"` | Apply fixes → STOP |
| `"merge"` / `"Approved – merge"` | Merge + cleanup → STOP |
