# AGENTS

## Quality Gate

- Always run `bunx biome ci .` before committing.
- Do not rely on `npm run lint` alone; it runs `biome lint --write ./` and can miss CI checks (format + organize imports).
- CI source of truth is `/Users/marijn/Projects/zuidwest/teksttv/.github/workflows/pull_request.yml`, which runs `bunx biome ci .`.
- If `bunx biome ci .` fails, fix those issues locally and rerun it until clean before push.
