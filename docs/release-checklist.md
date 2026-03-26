# Release checklist

## Pre-release
- Confirm all milestone issues are merged and closed.
- Run `bun test` and verify no failing suites.
- Validate exported entrypoints and published files.
- Review README, examples, and migration guidance.
- Confirm provider configuration examples are current.

## Packaging
- Verify `package.json` metadata, repository, license, and keywords.
- Verify `main`, `module`, `types`, and `exports` entries point to built artifacts.
- Ensure only required files are published.

## Versioning
- Choose the next semantic version.
- Prepare release notes or changelog entry.
- Check for breaking changes and upgrade notes.

## Publish
- Build the package.
- Publish to npm using the intended access and token.
- Create a Git tag and GitHub release.

## Post-release
- Smoke-test installation in a consumer app.
- Validate docs links and package page metadata.
- Track first-release issues and follow-up fixes.
