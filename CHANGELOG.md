# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Real Meta WhatsApp Cloud API provider (`providers.whatsapp.provider: 'meta'`) with text message support via the Graph API
- Real Twilio SMS provider (`providers.sms.provider: 'twilio'`) with Programmable Messaging API integration
- Real Twilio WhatsApp provider (`providers.whatsapp.provider: 'twilio'`) with WhatsApp-prefixed messaging
- Config validation for Meta WhatsApp (`accessToken`, `phoneNumberId`) and Twilio WhatsApp (`accountSid`, `authToken`, `from`) credentials at plugin initialization
- Provider factory pattern dispatching to concrete implementations based on `provider` field
- Comprehensive test suite for all three provider implementations (Meta WhatsApp, Twilio SMS, Twilio WhatsApp)
- Provider configuration reference table and environment variable documentation in README
- Exported `createMetaWhatsAppProvider`, `createTwilioSMSProvider`, `createTwilioWhatsAppProvider` for advanced usage

### Changed
- WhatsApp and SMS provider factories now create real HTTP-based provider adapters instead of returning mock results
- Updated README with full provider setup guides, prerequisites, limitations, and environment variable tables

## [0.1.1] - 2026-03-09

### Added
- Initial project structure
- Core plugin configuration

## [0.0.1] - 2026-03-09

### Added
- Initial release
