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
  * **Frontend developers / agents**: Focus work inside `apps/frontend/`.
  * **Admin frontend developers / agents**: Focus work inside `apps/admin/`.
  * **Backend developers / agents**: Focus work inside `apps/server/`.
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
4. Verify tests / build across `apps/frontend/`, `apps/admin/`, and `apps/server/`.
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

---

## 8. Design & UI Guidelines

### 8.1 Color Usage — Use `globals.css` Tokens Only

* **Always use semantic color tokens defined in `globals.css` (`@theme { --color-* }`) via Tailwind utilities** — e.g. `bg-primary`, `text-primary`, `border-primary`, `bg-primary-light`, `text-muted`, `bg-bg-soft`, `border-border`, `bg-success`, `text-danger`, etc.
* **Never hardcode hex colors** (e.g. `#800A1D`, `#FFFFFF`, `#0A0E11`, `#E5E7EB`) or `rgb()`/`hsl()` literals in components, inline styles, or CSS. If a needed token does not exist, add it to `apps/frontend/src/app/globals.css` and/or `apps/admin/src/app/globals.css` in `@theme` first, then reference it with the `-primary` / `-<token>` format.
* **Reference locations:**
  * Frontend: `apps/frontend/src/app/globals.css`
  * Admin: `apps/admin/src/app/globals.css`
* **Available tokens include (non-exhaustive):** `primary`, `primary-hover`, `primary-light`, `primary-bg`, `text`, `muted`, `subtle`, `bg`, `bg-soft`, `light`, `black`, `dark`, `dark-secondary`, `border`, `success`, `success-light`, `warning`, `warning-light`, `danger`, `danger-light`, `info`, `info-light`, `neutral-status`, `neutral-status-light`.

### 8.2 No Emojis or Sparkle Icons

* **Emojis and sparkle/decorative icons (e.g. ✨, 🎉, 🌟, 💫, ⭐, ✨) are not allowed** in code, UI copy, components, comments, or documentation. Use proper icon libraries (`lucide-react`, `react-icons`) or typographic elements instead.
* This applies to all apps (`apps/frontend`, `apps/admin`, `apps/server`) — keep the UI professional and consistent.

### 8.3 Simplicity & Information Density — Keep It Intuitively Usable

* **Aim for simple, uncluttered, uncongested design that needs no explanation.** Any user should understand how to use a page without a walkthrough or tooltip tour. If a page needs explaining, simplify it.
* **Do not overload a single page with too much information at once.** Prefer focus: one primary purpose per view, clear hierarchy, generous whitespace, and progressive disclosure.
* **Split dense content across separate pages/flows when needed.** If information or actions compete for attention, separate them into dedicated pages or stepped flows (e.g. list → detail, tabs, wizard steps) rather than cramming everything into one view.
* **Default to fewer elements, clearer labels, and obvious affordances** over dense dashboards, stacked cards, or long walls of controls. Optimize for scanability and self-evidence, not for showing everything at once.
