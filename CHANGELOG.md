# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING:** Default channels changed from `['email', 'whatsapp', 'sms', 'inapp']` to `['email', 'inapp']`. SMS and WhatsApp must now be explicitly enabled with provider credentials.
- **BREAKING:** Configuration validation now runs at plugin creation time (fail-fast). Invalid configs that previously failed silently at runtime now throw immediately with clear `payload-notifications:` prefixed error messages.
- **BREAKING:** In-app notifications now persist resolved template `title` and `message` with token replacement instead of generic placeholder text.
- Task handlers are now wired as live handlers via `onInit` and work out of the box without host-app overrides. The deferred handler pattern has been removed.
- All validation error messages now use a consistent `payload-notifications:` prefix.

### Added
- Live task handler registration through plugin `onInit` hook — jobs execute without host-app wiring
- `validateNormalizedOptions()` is called automatically during plugin creation
- Validation for unknown channel names
- Validation for empty channels array
- Twilio WhatsApp credential validation (accountSid, authToken, from)
- In-app channel resolves and renders template `title` and `body` fields with token replacement
- Tests for live task handler execution, pre-init failure, onInit chaining, in-app template resolution, and expanded config validation
- Documentation for jobs processing, serverless constraints, and migration from 0.1.x

### Fixed
- Task handlers no longer return a `state: 'failed'` deferred error — they execute the real job logic after initialization

## [0.1.1] - 2026-03-26

### Added
- Initial project structure
- Core plugin configuration

## [0.0.1] - 2026-03-09

### Added
- Initial release
