# CI budget

The `CI` workflow (`.github/workflows/ci.yaml`) runs on each PR and on each push to `main`. It has one job, `Checks`. The job runs `npm run ci`, which is `turbo run ci` (`check-format`, `check-types`, `build` and `test` of each workspace).

## Target

| Case                                                 | Budget  |
| ---------------------------------------------------- | ------- |
| PR run, lockfile not changed, a few packages changed | 1.5 min |
| Run with a changed `package-lock.json` (cache miss)  | 3 min   |
| Timeout                                              | 15 min  |

## Rules

- `node_modules` (root, `packages/*`, `examples/*`) is restored from the cache. The key is the OS, the architecture, the Node version and the hash of `package-lock.json` and of each `package.json`. A manifest change without a lockfile change misses the cache, so `npm clean-install` still rejects it. On a miss, the job runs `npm clean-install` with the npm download cache.
- The Turbo cache (`.turbo/cache`) is restored from the newest entry of the same OS, architecture and Node version. Turbo replays a task only when the hash of its inputs is the same, so a changed package builds and tests again.
- The checks stay in one job. `check-types` depends on `build`, so parallel jobs would each install and build again. Turbo already runs the tasks in parallel in the job.
- A new push to a PR cancels the older run of the PR. Runs on `main` are not cancelled.
- Do not skip tests, remove tests or lower thresholds to meet the budget.
- The release workflow (`release.yaml`) does not use these caches. It installs and builds from a clean state.
