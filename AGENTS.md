# Workspace Development Rules

## Git Branch

This project uses separate branches for each contributor.

My personal branch is:

```text
abdullah
```

Never switch to or commit directly to `main` unless explicitly instructed.

All changes I make should be committed and pushed to:

```text
origin/abdullah
```

## Before Starting Any Coding Task

Before modifying files:

1. Check the current branch.

```bash
git branch --show-current
```

2. Confirm that the current branch is `abdullah`.

3. Check the repository status.

```bash
git status
```

4. Make sure the local repository has the latest remote information.

```bash
git fetch origin
```

5. Because this project uses `main` as the shared integration branch, check whether `origin/main` contains changes that are not currently in the working branch.

6. When appropriate, synchronize the current branch with the latest `main`:

```bash
git merge origin/main
```

Do not automatically merge `origin/main` in the middle of an active coding task. Synchronize before beginning substantial work when the working tree is clean and doing so is safe.

## Git Auto-Fetch

VS Code/Antigravity is configured to automatically fetch remote changes.

Do not assume that auto-fetch means the current branch has been updated.

Auto-fetch updates Git's remote-tracking information, such as:

```text
origin/main
```

It does not automatically merge those changes into the current branch.

Before relying on the remote state, verify it with:

```bash
git fetch origin
```

Do not configure the agent to repeatedly or automatically merge `origin/main` without checking the current working state first.

## During Development

Work only on the `abdullah` branch.

Do not modify, reset, rebase, or commit to another contributor's branch.

Do not push directly to `main`.

Keep commits focused on the work being performed.

## Before Committing

Run:

```bash
git status
```

Review the changed files.

Make sure unrelated files or changes are not included.

Then:

```bash
git add .
git commit -m "Describe the change"
```

## Push

Push completed work to the personal branch:

```bash
git push origin abdullah
```

After the first upstream has been configured, this can normally be shortened to:

```bash
git push
```

## Main Branch Synchronization

The team's contributors work independently.

The current repository structure is:

```text
main
├── codiac
├── faruq
└── abdullah
```

Do not pull or merge `codiac` or `faruq` into the `abdullah` branch unless explicitly instructed.

The shared branch to monitor is:

```text
origin/main
```

When new work has been merged into `main`, update the local remote-tracking information and, when appropriate, merge it into `abdullah`:

```bash
git fetch origin
git merge origin/main
```

If a merge conflict occurs:

1. Do not discard existing work.
2. Inspect the conflicting files.
3. Explain the conflict clearly.
4. Resolve it while preserving the intended functionality from both sides where appropriate.
5. Run the relevant tests or checks.
6. Confirm the working tree is clean or contains only intentional changes.

## Important Safety Rules

Never run destructive Git commands such as:

```bash
git reset --hard
git clean -fd
git checkout .
```

unless explicitly instructed.

Never force-push to a shared branch.

Never overwrite another contributor's work merely to resolve a conflict.

Do not assume that a clean working tree means the branch contains the latest `main`.

Before making significant changes, verify:

```bash
git branch --show-current
git status
git fetch origin
```

The agent should prioritize preserving existing work and maintaining the repository's branch structure.
