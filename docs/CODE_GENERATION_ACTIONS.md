# GraphQL client generation via GitHub Actions

The dedicated [runner Issue #137](https://github.com/hazuki3417/memoria-web/issues/137) accepts new comments after this workflow is merged into the default branch (`develop`).

Only comments by repository owner `hazuki3417` are accepted. Post a standalone JSON object:

```json
{"task":"graphql","branch":"feature/my-change"}
```

- `task` must be `graphql`.
- `branch` must already exist and start with `feature/`, `fix/`, `docs/`, `refactor/`, `chore/`, or `hotfix/`; protected branches are not valid targets.
- Each new comment triggers one run; edits do not rerun.
- The action runs `npm ci`, `npm run graphql:codegen`, `npm run check:type`, and `npm run test:unit` against the requested branch.
- Only `src/infrastructure/graphql/generated.ts` may change. Generated changes are committed and pushed to that branch without force.
- Requests are serialized. If a concurrent update prevents push, investigate rather than overwriting it.
- Inspect [workflow runs](https://github.com/hazuki3417/memoria-web/actions/workflows/code-generation.yml) for results. PR review and normal quality gates remain required.
- Generation uses the branch's committed `src/infrastructure/graphql/schema.graphql` snapshot, **not** live API introspection. Synchronize that snapshot with the authoritative `memoria-api/schemas/graphql/` contract separately before generation.

Security: comment input is untrusted. The workflow accepts no custom commands, workflow paths, schema URLs, or protected branches. The workflow requires `contents: write` for generated-code pushes.
