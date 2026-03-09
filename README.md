# @wtree/payload-notifications

[![NPM Version](https://img.shields.io/npm/v/@wtree/payload-notifications?style=flat-square)](https://npmjs.com/package/@wtree/payload-notifications)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Node Version](https://img.shields.io/node/v/@wtree/payload-notifications?style=flat-square)](https://nodejs.org)

Production-ready notifications plugin for **Payload CMS** with a **policy-first**, **integration-driven** architecture.

---

## Features

- 📧 Multiple notification channels (email, SMS, push, in-app)
- 🎯 Template-based notification system
- 🔔 Real-time notification delivery
- 📈 Notification history and tracking
- ⚙️ Flexible integration with existing collections
- 🔒 Policy-first access control
- 🎨 Customizable UI components
- 📊 Analytics and read/unread tracking

---

## Requirements

### Runtime requirements

- `node >= 18.0.0`
- `payload ^3.79.0` (peer dependency)

### Recommended

- Node 20 LTS for production
- TypeScript 5.x for development

---

## Installation

```bash
npm install @wtree/payload-notifications
```

or

```bash
bun add @wtree/payload-notifications
```

---

## Quick start

### 1) Register plugin

```ts
import { buildConfig } from 'payload'
import { payloadNotifications } from '@wtree/payload-notifications'

export default buildConfig({
  plugins: [
    payloadNotifications({
      enabled: true,
      // Add your configuration here
    }),
  ],
})
```

---

## Configuration

```ts
type NotificationsPluginOptions = {
  enabled?: boolean
  // Additional options will be added here
}
```

---

## Development

### Setup

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Build the plugin
bun run build

# Lint code
bun run lint

# Format code
bun run format
```

### Project Structure

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── publish.yml
│   └── dependabot.yml
├── src/
│   ├── client/
│   ├── index.ts
│   ├── plugin.ts
│   ├── types.ts
│   └── browser.ts
├── tests/
├── package.json
├── tsconfig.json
├── rolldown.config.js
└── README.md
```

---

## Scripts

- `bun run build` - Build the plugin for production
- `bun run dev` - Watch mode for development
- `bun run clean` - Remove dist directory
- `bun test` - Run tests
- `bun test --watch` - Run tests in watch mode
- `bun test --coverage` - Run tests with coverage
- `bun run lint` - Lint source code
- `bun run lint:fix` - Fix linting issues
- `bun run format` - Format code
- `bun run format:check` - Check code formatting

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

## Compatibility

See [COMPATIBILITY.md](./COMPATIBILITY.md) for version compatibility information.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

---

## License

MIT
