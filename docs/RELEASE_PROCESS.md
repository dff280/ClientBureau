# Client Bureau Release Process

This document is the source of truth for how Client Bureau changes move from local development to GitHub and then to the VPS.

## Branch Rules

- `main` is the production branch. The VPS should pull from `main`.
- All new work starts on a feature branch with the `codex/` prefix.
- Do not push unfinished work directly to `main`.
- Push feature branches freely after local checks pass.
- Merge or fast-forward `main` only when the update is intentionally approved for release.

Recommended branch names:

- `codex/homepage-polish`
- `codex/search-upgrade`
- `codex/admin-fixes`
- `codex/release-process-cleanup`
- `codex/launch-reliability-revenue-readiness`

## Standard Update Flow

1. Start from the latest production state.

   ```bash
   git switch main
   git pull --ff-only origin main
   git switch -c codex/name-of-update
   ```

2. Make the change.

3. Run the local verification suite.

   ```bash
   npm run lint
   npm test
   npm run build
   npm run seo:check:local
   npm run mobile:check
   ```

4. Commit the feature branch.

   ```bash
   git add .
   git commit -m "Clear release message"
   git push origin codex/name-of-update
   ```

5. Release only after approval.

   ```bash
   git switch main
   git pull --ff-only origin main
   git merge --ff-only codex/name-of-update
   git push origin main
   ```

If a fast-forward merge is not possible, stop and review the branch history instead of forcing it.

## Versioning

Use semantic-style product versions:

- Patch: `0.2.1` for bug fixes, copy polish, accessibility, small UI corrections.
- Minor: `0.3.0` for new workflows, major page upgrades, new public surfaces, or dashboard/admin feature groups.
- Major: `1.0.0` when Client Bureau is considered generally launch-ready with live billing, policies, support flow, and production operations.

Every release should update `CHANGELOG.md` before `main` is pushed.

Recommended tag command after a successful release:

```bash
git tag -a v0.2.1 -m "Client Bureau v0.2.1"
git push origin v0.2.1
```

## VPS Deployment

The VPS deploys from `main`.

```bash
cd /opt/ClientBureau
git fetch origin
git checkout main
git pull --ff-only origin main
bash scripts/vps-deploy.sh
```

If `/opt/ClientBureau` does not exist yet, run the latest deploy script directly from GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/dff280/ClientBureau/main/scripts/vps-deploy.sh | bash
```

The deploy script pulls `main`, stamps `GIT_COMMIT_SHA` and `GIT_BRANCH` into `.env.production`, rebuilds Docker, prunes old images, and prints the live version/health endpoints.

Post-deploy checks:

```bash
curl -I https://clientbureau.com
curl https://clientbureau.com/api/version
curl https://clientbureau.com/api/health
curl https://clientbureau.com/robots.txt
curl https://clientbureau.com/sitemap.xml
```

Run the full live release verifier from your local machine after the VPS rebuild:

```powershell
npm run verify:live
```

The verifier automatically compares production against the local `package.json` version and current Git commit. It fails for stale version/commit identity, broken public profile links, profile loading shells, missing core Supabase readiness, bad canonicals, missing unified profile graph routes, missing diagnostic no-store headers, unsafe logged-out protected-route behavior, missing protected-route return paths, and public privacy leaks. It warns for expected rollout gaps such as Stripe not being configured yet.

To intentionally inspect production without comparing release identity, run:

```powershell
$env:SKIP_RELEASE_IDENTITY_CHECK="1"
npm run verify:live
Remove-Item Env:SKIP_RELEASE_IDENTITY_CHECK
```

## Rollback

If a release causes a production issue:

1. Identify the previous known-good tag or commit.
2. Revert the release commit on `main` instead of rewriting history.

   ```bash
   git switch main
   git pull --ff-only origin main
   git revert <bad_commit_sha>
   git push origin main
   ```

3. Rebuild the VPS.

   ```bash
   cd /opt/ClientBureau
   git pull --ff-only origin main
   docker compose up -d --build
   ```

For advanced ops rollout issues, set `PLATFORM_FEATURE_DATA_MODE=mock`, rebuild, and keep core Supabase auth, reports, admin approval, public profiles, and SEO records untouched.

## Hotfix Flow

Use hotfix branches for urgent production bugs:

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/hotfix-short-name
```

After the fix passes checks, merge it into `main`, deploy, and add a patch changelog entry.

## Safety Rules

- Never commit `.env`, `.env.local`, `.env.production`, API keys, service-role keys, Stripe secrets, or private SSH keys.
- Do not put server passwords into shell commands or commit history.
- Prefer SSH keys for deploy access.
- Public pages must not expose raw emails, phone numbers, street addresses, raw evidence files, pending reports, rejected reports, private contract content, or internal admin notes.
- `PLATFORM_FEATURE_DATA_MODE=supabase` is the production target after readiness checks pass. Roll back to `mock` only if an advanced ops workflow needs review.

## Release Checklist

Before pushing `main`:

- `CHANGELOG.md` has a clear entry.
- `npm run lint` passes.
- `npm test` passes.
- `npm run build` passes.
- `npm run seo:check:local` passes after `npm run build`, or `SEO_BASE_URL=https://clientbureau.com npm run seo:check` passes for a live-release validation.
- `npm run mobile:check` passes.
- `npm run verify:live` passes after the VPS rebuild.
- Manual logged-in QA follows `docs/LIVE_WORKFLOW_QA_RUNBOOK.md`.
- Browser QA covers the changed public/dashboard/admin routes.
- No secrets or private data appear in `git diff`.
- The release is intentionally approved for production.
