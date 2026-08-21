# Git Safety Rules

1. **Verify State Before Working**:
   - Always run `git branch --show-current`, `git status`, and `git fetch origin` before starting a task.
   - Work only on the contributor's designated branch (e.g. `codiac`, `faruq`, `abdullah`).

2. **No Direct Pushes to Main**:
   - Never push directly to `main` without explicit approval and a full verification of both `frontend/` and `server/`.

3. **Forbidden Destructive Commands**:
   - `git reset --hard`
   - `git clean -fd`
   - `git checkout .`
   - `git push --force` / `git push -f`
   - Any command that discards uncommitted work or rewrites shared branch histories.

4. **Merge Protocol**:
   - Keep contributor branches updated by merging `origin/main` regularly when working trees are clean.
   - Resolve conflicts with care, preserving functionality from both sides and testing builds afterwards.
