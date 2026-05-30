# SonarQube Setup — dodo-adapters

## Overview

This document explains the SonarQube code quality analysis setup for the `dodo-adapters` monorepo, what it does, and what manual steps are still pending.

---

## Files Added

| File | Purpose |
|------|---------|
| `.github/workflows/sonarqube.yaml` | GitHub Actions workflow that runs the SonarQube scan |
| `sonar-project.properties` | SonarQube project configuration |

---

## How It Works

### Workflow Triggers
The SonarQube analysis runs automatically on:
- Every **push to `main`**
- Every **pull request targeting `main`**
- **Manual trigger** via GitHub Actions → Run workflow button

### What Each Step Does

```
1. Checkout repository
   └── Fetches full git history (fetch-depth: 0)
       Required for SonarQube to detect new vs existing issues

2. Setup Node.js
   └── Installs Node 22 with npm cache for faster runs

3. Install dependencies
   └── Runs npm clean-install across the monorepo

4. Run tests
   └── Runs: npx turbo run test --filter='./packages/*'
       Generates coverage report at packages/core/coverage/lcov.info
       This coverage file is what SonarQube uses to calculate coverage %

5. SonarQube Scan
   └── Uploads code + coverage report to SonarQube server
       GITHUB_TOKEN allows SonarQube to post inline comments on PRs (once GitHub App is configured)

6. SonarQube Quality Gate
   └── Checks if the scan results meet the quality gate conditions
       Fails the workflow if quality gate is not met
```

### sonar-project.properties

| Property | Value | Purpose |
|----------|-------|---------|
| `sonar.projectKey` | `dodo-adapters` | Unique identifier in SonarQube |
| `sonar.sources` | `packages, examples` | Directories to scan |
| `sonar.exclusions` | `node_modules, dist, coverage...` | Directories/files to skip |
| `sonar.javascript.lcov.reportPaths` | `packages/core/coverage/lcov.info` | Coverage report location |
| `sonar.scm.provider` | `git` | Enables new code detection on PRs |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SONAR_TOKEN` | Generated from SonarQube → My Account → Security |
| `SONAR_HOST_URL` | Your SonarQube server URL (e.g. `http://yourserver:9000`) |
| `GITHUB_TOKEN` | Auto-provided by GitHub — no setup needed |

---

## Current Results

| Metric | Value | Status |
|--------|-------|--------|
| Security | A (0 issues) | Good |
| Reliability | C (7 bugs) | Needs fixing |
| Maintainability | A | Good |
| Coverage | 31.2% | Low — needs more tests |
| Duplications | 17.0% | High |
| Security Hotspots | E (0% reviewed) | Needs review |

---

## Pending Manual Setup (Admin Access Required)

### 1. SonarQube UI — GitHub App Integration
**Why:** Without this, SonarQube cannot post inline comments on PRs even though `GITHUB_TOKEN` is passed.

**Steps:**
1. Log into SonarQube as admin
2. Go to `Administration → Configuration → DevOps Platform Integrations → GitHub`
3. Click **Create configuration**
4. Create a GitHub App:
   - Go to GitHub → `Settings → Developer Settings → GitHub Apps → New GitHub App`
   - Set permissions: `Pull requests` → Read & Write, `Checks` → Read & Write
   - Generate App ID, Client ID, Client Secret, and Private Key (.pem file)
5. Fill in the GitHub App details in SonarQube and save
6. Install the GitHub App on the `dodopayments/dodo-adapters` repository

### 2. GitHub Branch Protection Rules
**Why:** To block PRs from being merged when the SonarQube quality gate fails.

**Steps:**
1. Go to `dodopayments/dodo-adapters` → `Settings → Branches`
2. Click **Add branch protection rule**
3. Set branch pattern to `main`
4. Enable **Require status checks to pass before merging**
5. Search and add `SonarQube` as a required status check
6. Save

---

## How to Improve Coverage

Currently only `packages/core` has tests. Coverage is at 31.2% because the following files have no tests:
- `packages/core/src/checkout/checkout.ts`
- `packages/core/src/schemas/webhook.ts`

Writing tests for these files will significantly increase the coverage percentage.
