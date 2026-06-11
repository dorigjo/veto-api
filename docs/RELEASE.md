# VETO Release Procedure

## Pre-release checklist

Run this gate before every release. It must pass with zero failures:

```bash
npm run release:check
```

This runs: typecheck → test → build → openapi:check

## Release procedure

### 1. Verify on main branch

```bash
git status
git log --oneline -5
```

Ensure you are on `main` and working tree is clean.

### 2. Run release gate

```bash
npm run release:check
```

All checks must pass. Do not release if any fail.

### 3. Bump version

Update version in `package.json`. Follow semver:
- Patch (x.x.N): bug fix, rule clarification, no new required fields
- Minor (x.N.0): new profile, new optional field, backwards-compatible rule pack update
- Major (N.0.0): breaking API contract change

If `RULE_PACK_VERSION` changed, update `src/lib/version.ts` and `RULE_PACK_HASH`.

### 4. Commit

```bash
git add package.json src/lib/version.ts
git commit -m "Release vX.Y.Z"
```

### 5. Tag

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

### 6. Deploy (with explicit approval)

See `docs/DEPLOYMENT.md` for exact deploy procedure.

**Do not push or deploy without explicit founder approval.**

### 7. Verify deployment

After deploy:
```bash
curl https://api.veto.dev/v1/health
curl https://api.veto.dev/v1/version
```

Both must return 200 with correct version numbers.

## Rollback

See `docs/ROLLBACK.md`.
