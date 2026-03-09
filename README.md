# @wtree/payload-notifications

[![NPM Version](https://img.shields.io/npm/v/@wtree/payload-notifications?style=flat-square)](https://npmjs.com/package/@wtree/payload-notifications)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Node Version](https://img.shields.io/node/v/@wtree/payload-notifications?style=flat-square)](https://nodejs.org)

Production-ready notifications plugin for **Payload CMS** with a **multi-channel**, **event-driven**, and **provider-agnostic** architecture.

---

## Overview

This plugin is designed to unify transactional and future marketing notifications across multiple channels:

- Email
- WhatsApp
- SMS
- In-app notifications
- Future channels like push and Telegram

It is built to reuse native Payload capabilities wherever possible:

- Payload plugin system
- Payload Jobs queue
- Payload email support
- Existing app auth/user model
- React Email templates

---

## Goals

- Centralize notification delivery behind one plugin
- Support multi-channel routing per event
- Keep providers swappable and future-proof
- Persist in-app notifications and delivery logs
- Respect user preferences and consent settings
- Make the plugin safe for high-volume ecommerce workloads

---

## Architecture

### Event-driven pipeline

The plugin follows a decoupled notification pipeline:

1. Your app emits a notification event such as `order.paid` or `auth.resetPassword`
2. The plugin resolves matching notification rules
3. The plugin queues one job per target channel
4. Channel-specific workers send or persist the notification
5. Results are recorded in delivery logs

### Core components

- Event producers: order hooks, auth hooks, custom service calls
- Dispatcher: resolves routing rules and enqueues work
- Jobs queue: handles backpressure and async processing
- Channel handlers: email, WhatsApp, SMS, in-app
- Collections: `notifications`, `notification-logs`, future `campaigns`
- Preference layer: checks opt-in/opt-out state before delivery

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

```ts
import { buildConfig } from 'payload'
import { notificationsPlugin } from '@wtree/payload-notifications'

export default buildConfig({
  plugins: [
    notificationsPlugin({
      enabled: true,
      channels: ['email', 'whatsapp', 'inapp'],
      providers: {
        email: {
          defaultFromName: 'My Shop',
          defaultFromAddress: 'orders@shop.com',
        },
        whatsapp: {
          provider: 'twilio',
          from: 'whatsapp:+14155238886',
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
        },
      },
      templates: {
        email: './src/templates/email',
        whatsapp: './src/templates/whatsapp',
      },
      rules: [
        {
          event: 'order.paid',
          channels: ['email', 'inapp'],
          template: 'order-paid',
        },
      ],
    }),
  ],
})
```

---

## Plugin config

```ts
export type NotificationChannel = 'email' | 'whatsapp' | 'sms' | 'inapp' | 'push'

export type NotificationRule = {
  event: string
  channels: NotificationChannel[]
  template: string
  condition?: (payload: Record<string, unknown>) => boolean | Promise<boolean>
}

export type NotificationsPluginOptions = {
  enabled?: boolean
  channels?: NotificationChannel[]
  userCollectionSlug?: string
  collections?: {
    notifications?: string
    logs?: string
  }
  templates?: {
    email?: string
    whatsapp?: string
    sms?: string
  }
  providers?: {
    email?: {
      adapter?: unknown
      defaultFromName?: string
      defaultFromAddress?: string
    }
    whatsapp?: {
      provider?: 'twilio' | 'meta'
      accountSid?: string
      authToken?: string
      from?: string
      accessToken?: string
      phoneNumberId?: string
    }
    sms?: {
      provider?: 'twilio'
      accountSid?: string
      authToken?: string
      from?: string
    }
  }
  rules?: NotificationRule[]
}
```

---

## Collections

### Notifications

The `notifications` collection stores in-app inbox items for users.

Suggested fields:

- `title`
- `message`
- `recipient`
- `isRead`
- `readAt`
- `meta`

### Notification logs

The `notification-logs` collection stores one document per delivery attempt.

Suggested fields:

- `user`
- `channel`
- `status`
- `template`
- `error`
- `providerResponse`
- `event`
- `createdAt`

---

## Event model

```ts
export type NotificationEvent = {
  name: string
  userId?: string
  payload?: Record<string, unknown>
}
```

Events can be emitted manually from services or through collection hooks.

Example:

```ts
await req.payload.jobs.queue({
  task: 'notification:process-event',
  input: {
    name: 'order.paid',
    userId: doc.customerId,
    payload: {
      orderId: doc.id,
      total: doc.total,
    },
  },
})
```

---

## Jobs

### Process event

The `notification:process-event` task:

- resolves matching rules
- evaluates optional conditions
- checks user preferences
- queues one `notification:send` job per channel

### Send notification

The `notification:send` task:

- loads the user and channel context
- renders the correct template
- sends or persists the notification
- writes a delivery log entry
- stores error details for retries and debugging

---

## Channels

### Email

- Uses the existing Payload email adapter by default
- Supports adapter override inside plugin config
- Renders templates from React Email-compatible sources

### WhatsApp

- Uses a provider abstraction so Twilio or Meta can be swapped later
- Sends templated text or structured provider payloads

### SMS

- Shares the same provider abstraction pattern as WhatsApp
- Designed for OTPs, alerts, and transactional updates

### In-app

- Writes directly into the `notifications` collection
- Enables inbox UI, unread counts, and later mobile support

---

## Project structure

```text
src/
  plugin.ts
  index.ts
  types.ts
  collections/
    Notifications.ts
    NotificationLogs.ts
  jobs/
    processEvent.ts
    sendNotification.ts
  channels/
    email.ts
    whatsapp.ts
    sms.ts
    inapp.ts
  providers/
    email.ts
    twilio.ts
  templates/
    email/
    whatsapp/
```

---

## Testing

The plugin uses `bun test` for unit and integration-friendly tests.

Recommended coverage areas:

- rule matching
- job queueing behavior
- preference filtering
- provider dispatch
- in-app persistence
- failure logging and retry-safe behavior

Run:

```bash
bun test
bun test --watch
bun test --coverage
```

---

## Linting and formatting

```bash
bun run lint
bun run lint:fix
bun run format
bun run format:check
```

---

## Migration plan

### Phase 1

Start with one transactional event such as `order.paid` using email only.

### Phase 2

Replace direct app-level `sendEmail` calls with notification events.

### Phase 3

Enable WhatsApp and SMS providers for selected flows.

### Phase 4

Enable in-app notifications for account alerts and order updates.

### Phase 5

Add campaign and drip support on top of the same event, template, and log infrastructure.

---

## Roadmap

- Admin UI for rule management
- Campaigns and audience segments
- Retry policies and dead-letter workflow
- Push notification channel
- Per-tenant/provider configuration
- Delivery analytics dashboard

---

## Compatibility

See [COMPATIBILITY.md](./COMPATIBILITY.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT
