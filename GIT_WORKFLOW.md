# Git Workflow — Hubpay CRM

A simple step-by-step reference for saving and tracking changes to the project.

---

## Setup (run once)

Before making your first commit, tell Git who you are:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Initialize the repository (already done):

```bash
mkdir ~/hubpay-crm
cd ~/hubpay-crm
git init
```

---

## Everyday Workflow

### 1. Check what changed
After editing any file, see which files were modified:

```bash
git status
```

### 2. See the actual changes line by line
Review exactly what was added or removed before saving:

```bash
git diff
```

### 3. Stage your changes
Mark all changed files to be included in the next snapshot:

```bash
git add .
```

Or stage a specific file only:

```bash
git add index.html
```

### 4. Save a snapshot (commit)
Write a short message describing what you changed:

```bash
git commit -m "Describe what you changed here"
```

---

## Example Commit Messages

| Change | Message |
|---|---|
| Add new lead fields | `add industry and size fields to lead form` |
| Fix search bug | `fix search not matching email addresses` |
| Update styling | `update sidebar colors and typography` |
| Add persistence | `persist leads to localStorage on save` |

---

## Useful Extra Commands

```bash
# See full commit history
git log --oneline

# Undo changes to a file (before staging)
git checkout -- index.html

# See what's staged and ready to commit
git diff --staged
```

---

## Project Files

| File | Purpose |
|---|---|
| `index.html` | Full CRM app (UI + data + logic) |
| `main.js` | Electron desktop wrapper |
| `package.json` | Build config and dependencies |
| `dist/` | Built output — contains the installer `.exe` |
