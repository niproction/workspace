# Bootstrap Checklist — New Repository

> Run this once per new repo, in order.
> Everything here is a prerequisite before feature work begins.
> Check detection output first — only do steps that are missing.

---

## Step 1 — GitHub Token

- [ ] Create `.gh_token` file in project root with a GitHub personal access token
- [ ] Token needs scopes: `repo` + `workflow`
- [ ] Verify `.gh_token` is in `.gitignore` before any push

```bash
echo ".gh_token" >> .gitignore
```

Test:
```bash
GH_TOKEN=$(cat .gh_token) gh auth status
```

---

## Step 2 — Remote

- [ ] Create repo on GitHub and set remote:

```bash
GH_TOKEN=$(cat .gh_token) gh repo create <name> --private --source=. --remote=origin
```

Or if repo already exists:
```bash
git remote add origin https://github.com/<owner>/<repo>.git
```

---

## Step 3 — CI Workflow

- [ ] `.github/workflows/ci.yml` exists and runs lint → build → test on `pull_request`

Minimum structure:
```yaml
name: CI
on:
  pull_request:
    branches: [main]
jobs:
  ci:
    name: Lint / Build / Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

> The job name (`Lint / Build / Test`) must match the `contexts` value in Step 5.

---

## Step 4 — First Push

Push to default branch once (before protection is active):

```bash
git push -u origin main
```

---

## Step 5 — Branch Protection

- [ ] Enable branch protection with required status checks:

```bash
GH_TOKEN=$(cat .gh_token) gh api \
  repos/<owner>/<repo>/branches/main/protection \
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

Verify:
```bash
GH_TOKEN=$(cat .gh_token) gh api repos/<owner>/<repo>/branches/main/protection \
  --jq '{ci: .required_status_checks.contexts, prs: .required_pull_request_reviews}'
```

Expected output:
```json
{
  "ci": ["Lint / Build / Test"],
  "prs": { ... }
}
```

---

## Step 6 — Verify Detection

Run detection from `DETECTION.md`. The summary should show:

```
- Default branch: main (protected: CI enforced, PRs required)
- Token: .gh_token ✓
- CI: present: ci.yml
- Status: Ready for features
```

If any line shows a gap → fix it before starting features.

---

## Done

From this point, the workflow in `PLAYBOOK.md` is fully enforced at the GitHub level.
No broken code can merge — not by process alone, but by technical enforcement.
