# Testing strategy

## Scope
This plugin should maintain automated coverage across:
- collections
- config normalization and validation
- event processing and send jobs
- channel success, skip, and failure paths
- template resolution and rendering
- policy and preference evaluation
- reliability helpers

## Principles
- Prefer focused unit tests with explicit mocks.
- Cover success, failure, and edge cases.
- Keep provider integrations abstracted behind adapters.
- Add regression tests for every production bug fix.

## CI expectations
A healthy CI run should include:
- dependency install
- format and lint checks when configured
- `bun test`
- package build validation before publish

## Contributor guidance
When adding features:
1. Add or update tests in the nearest module test file.
2. Cover at least one unhappy path.
3. Prefer deterministic inputs and explicit assertions.
4. Document any intentionally deferred coverage.
