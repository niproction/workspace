# Autonomous Detection Guide

> Run this at the start of every session — before anything else.
> Never assume. Always detect. Never require the user to configure anything.

---

## 1. Git Identity

```bash
git config user.name
git config user.email
```
Use these as the commit author. Never hardcode names.

---

## 2. Remote & Repository

```bash
git remote get-url origin
```
Parse owner and repo name from the URL for all `gh api` calls.
- HTTPS: `https://github.com/<owner>/<repo>.git`
- SSH:   `git@github.com:<owner>/<repo>.git`

---

## 3. GitHub Auth Token

```bash
ls .gh_token 2>/dev/null && echo "EXISTS" || echo "MISSING"
```
- Present → use `GH_TOKEN=$(cat .gh_token) gh <command>`
- Missing → tell user: "Add your GitHub token to `.gh_token` (gitignored) to enable PR workflow."

---

## 4. Tech Stack

Check for these files:

| File | Stack |
|------|-------|
| `package.json` | Node.js — inspect `dependencies` + `scripts` |
| `requirements.txt` / `pyproject.toml` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml` / `build.gradle` | Java / Kotlin |

For Node: read `package.json` → detect framework (next, react, vue, express…), test runner (vitest, jest…), and available scripts.

---

## 5. Quality Gate Commands

Detect from `package.json` scripts or stack defaults:

| Stack | Lint | Build | Test |
|-------|------|-------|------|
| Node/Next.js | `npm run lint` | `npm run build` | `npm test` |
| Python | `ruff check .` | — | `pytest` |
| Go | `go vet ./...` | `go build ./...` | `go test ./...` |
| Rust | `cargo clippy` | `cargo build` | `cargo test` |

---

## 6. CI Presence

```bash
ls .github/workflows/ 2>/dev/null || echo "NO_CI"
```
- Present → note trigger events
- Missing → include CI setup in bootstrap plan

---

## 7. Branch Strategy & State

```bash
git branch -a
git log --oneline -10
git status
```
- Detect default branch (`main` / `master`)
- Check for existing open branches or uncommitted work

---

## 8. Branch Protection (actual check — do not infer)

Only run if `.gh_token` exists:

```bash
GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/branches/<default-branch>/protection 2>/dev/null
```

Parse the response for:
- `required_status_checks` → present = CI enforced at GitHub level / null = CI advisory only
- `required_pull_request_reviews` → present = PRs required / null = direct push to main allowed

If the call returns 404 or fails → branch protection is **OFF**.

Output one of:
- `protected: CI enforced, PRs required` — fully hardened
- `protected: PRs required, CI not enforced` — partial (soft CI)
- `protected: CI enforced, no PR requirement` — partial
- `unprotected` — no rules, main is exposed

If unprotected or partial → flag it clearly in the detection summary and note: "run bootstrap checklist."

---

## 9. Open PRs

```bash
GH_TOKEN=$(cat .gh_token) gh pr list
```
- Any open → do NOT touch, wait for user signal

---

## 10. Detection Summary Output

After detection, output exactly this block:

```
## Repo Detected

- Owner/Repo:    <owner>/<repo>
- Git user:      <name> <<email>>
- Stack:         <framework + language + styling>
- Pkg manager:   <npm / pip / cargo / go>
- Quality gates: <lint command> → <build command> → <test command>
- CI:            <present: filename> / <missing>
- Token:         <.gh_token ✓ / missing>
- Default branch: <main/master> (<protection status from step 8>)
- Open PRs:      <none / list>
- Status:        <Ready for features / Needs bootstrap>
```

If anything is missing (no CI, no tests, no remote, no token, unprotected branch) → say so clearly and propose what needs to be bootstrapped before features can begin.
