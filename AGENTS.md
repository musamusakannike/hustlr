# Workspace Development Rules & Team Collaboration Guidelines

## 1. Contributor & Branch Identity

This repository uses a multi-contributor workflow with dedicated branches and feature branches.

### Team Contributor Branches:
```text
main (Integration & Production Branch)
├── codiac
├── faruq
└── abdullah
```

### Dynamic Branch Rule:
* **Auto-detect your active branch**: At the start of every session or task, check the active working branch:
  ```bash
  git branch --show-current
  ```
* **Work only on the active user branch**: If you are working on `codiac`, commit and push to `origin/codiac`. If on `faruq`, push to `origin/faruq`. If on `abdullah`, push to `origin/abdullah`.
* **Never commit or push directly to `main`** unless explicitly instructed by the user.
* **Do not switch to, modify, rebase, or overwrite another contributor's branch directly.**

---

## 2. Before Starting Any Coding Task

Before modifying any files:

1. **Check current branch**:
   ```bash
   git branch --show-current
   ```
2. **Check repository working state**:
   ```bash
   git status
   ```
3. **Fetch latest remote changes**:
   ```bash
   git fetch origin
   ```
4. **Synchronize with `main` when safe**:
   Before beginning substantial new work (and when the working tree is clean), pull updates from the shared integration branch:
   ```bash
   git merge origin/main
   ```
   > [!NOTE]
   > Do not automatically merge `origin/main` in the middle of active, uncommitted coding edits. Synchronize at the start of a task when the working tree is clean.

---

## 3. During Development

* **Directory Boundaries**:
  * **Frontend developers / agents**: Focus work inside `frontend/`.
  * **Backend developers / agents**: Focus work inside `server/`.
* **Keep commits focused**: Group changes logically and write clear semantic commit messages (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
* **Never copy-paste code files between branches**: Use proper Git merges/PRs from `main` to maintain commit history and avoid 3-way merge conflicts.

---

## 4. Before Committing & Pushing

1. **Review modified files**:
   ```bash
   git status
   ```
   Ensure no unintended files (e.g. `.env`, temp files, unwanted lockfile diffs) are staged.
2. **Stage and commit**:
   ```bash
   git add .
   git commit -m "feat(scope): concise description of change"
   ```
3. **Push to your contributor branch**:
   ```bash
   git push origin <your-branch-name>
   ```

---

## 5. Merging to `main` (Integration Protocol)

When work on a contributor branch is complete and ready for integration:

1. Ensure the contributor branch is pushed and up to date with `origin/main`.
2. Checkout `main` and pull latest:
   ```bash
   git checkout main
   git pull origin main
   ```
3. Merge the contributor branch:
   ```bash
   git merge <contributor-branch> -m "feat: merge <contributor-branch> into main"
   ```
4. Verify tests / build across both `frontend/` and `server/`.
5. Push to `origin/main`:
   ```bash
   git push origin main
   ```
6. Switch back to your working branch and merge `main`:
   ```bash
   git checkout <your-branch-name>
   git merge main
   git push origin <your-branch-name>
   ```

---

## 6. Resolving Merge Conflicts

If a merge conflict occurs:
1. **Never discard existing work** or wipe another contributor's code.
2. Inspect the conflicting files carefully.
3. Understand the intent of both sides and resolve conflicts preserving functionality.
4. Run syntax/build checks on both frontend and server.
5. Commit the resolved merge cleanly.

---

## 7. Critical Git Safety Rules

* **Never run destructive commands** without explicit user permission:
  * `git reset --hard`
  * `git clean -fd`
  * `git checkout .`
* **Never force-push (`git push --force` or `git push -f`)** to `main` or shared branches.
* **Always verify git state** before starting complex operations:
  ```bash
  git branch --show-current && git status && git fetch origin
  ```
