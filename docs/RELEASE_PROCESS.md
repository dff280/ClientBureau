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
   npm run seo:check
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
cd /opt/client-bureau
git pull --ff-only origin main
docker compose up -d --build
docker compose ps
```

Post-deploy checks:

```bash
curl -I https://clientbureau.com
curl https://clientbureau.com/api/health
curl https://clientbureau.com/robots.txt
curl https://clientbureau.com/sitemap.xml
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
   cd /opt/client-bureau
   git pull --ff-only origin main
   docker compose up -d --build
   ```

For advanced ops rollout issues, set `PLATFORM_FEATURE_DATA_MODE=mock`, rebuild, and keep core Supabase records untouched.

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
- `PLATFORM_FEATURE_DATA_MODE=supabase` should only be enabled after the required migrations and readiness checks pass.

## Release Checklist

Before pushing `main`:

- `CHANGELOG.md` has a clear entry.
- `npm run lint` passes.
- `npm test` passes.
- `npm run build` passes.
- `npm run seo:check` passes against a running local build.
- `npm run mobile:check` passes.
- Browser QA covers the changed public/dashboard/admin routes.
- No secrets or private data appear in `git diff`.
- The release is intentionally approved for production.
