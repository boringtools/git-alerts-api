## Summary

<!-- One or two sentences: what changed and why. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Refactor / chore
- [ ] Docs only

## Linked issue

Closes #

## Test evidence

There is no CI on this repo, so paste the command you ran and its result.

API (`api/`):

```bash
uv sync && uv run pytest
```

Result:

UI (`ui/`): no test runner is configured, so lint and build are the check.

```bash
cd ui && npm run lint && npm run build
```

Result:

## Migrations and breaking changes

- [ ] Migrations included, if models changed (`api/*/migrations/`)
- [ ] Breaking change: API response shape, env var, database, or deploy step changed
- [ ] Neither

Deployment or migration notes:

## UI changes

- [ ] Screenshot or short recording attached (light and dark, if the layout differs)
- [ ] No UI change

## Checklist

- [ ] READMEs updated if behaviour, config, or setup changed
- [ ] `.env.example` updated for any new environment variable
- [ ] No secrets, tokens, or real scan findings in the diff
