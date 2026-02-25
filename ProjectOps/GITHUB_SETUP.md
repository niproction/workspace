# GitHub Remote Setup

## One-Time Setup (Run These Commands Manually)

GitHub CLI (`gh`) is not installed. Two options:

### Option A: Install GitHub CLI (Recommended)
```powershell
# In PowerShell (as admin) or via winget:
winget install --id GitHub.cli

# Then authenticate:
gh auth login

# Then create repo and push (Claude will handle the rest):
gh repo create <repo-name> --private --source=. --remote=origin --push
```

### Option B: Manual via GitHub Web
1. Go to https://github.com/new
2. Create a repo named `<repo-name>` (private or public)
3. Copy the SSH or HTTPS remote URL, then run:
```bash
git remote add origin <YOUR_REPO_URL>
git branch -M main
git push -u origin main
```

## After Remote Is Set

Once `origin` is configured, Claude will:
- Create feature branches and push automatically
- Open PRs via `gh pr create` (requires GitHub CLI)
- Check CI status via `gh run list`

## Branch Protection (Recommended)

On GitHub → Settings → Branches → Add rule for `main`:
- Require PR before merging
- Require status checks to pass
- Do not allow force pushes
