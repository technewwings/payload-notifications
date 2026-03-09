# @wtree/payload-notifications

Production-ready notifications plugin for Payload CMS with an event-driven, multi-channel architecture for email, WhatsApp, SMS, and in-app delivery.

## Features
- Event-to-rule notification dispatch through Payload jobs
- Channel implementations for email, WhatsApp, SMS, and in-app notifications
- Delivery log persistence and in-app notification storage
- Template registry and resolution utilities with starter transactional templates
- Preference mapping, consent enforcement, and custom policy hooks
- Reliability helpers for idempotency, retry classification, retry-safe dispatch behavior, and observability hooks
- Bun-based test suite, contributor guidance, CI expectations, and release-readiness docs

## Installation
```bash
bun add @wtree/payload-notifications
```

## Quick start
```ts
import { notificationsPlugin } from '@wtree/payload-notifications'

export default notificationsPlugin({
  channels: ['email', 'sms', 'inapp'],
  providers: {
    email: {
      defaultFromAddress: 'noreply@example.com',
    },
    sms: {
      provider: 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_SMS_FROM,
    },
  },
  observability: {
    onDispatch: async (event) => {
      console.info(event)
    },
  },
  templates: {
    registry: {
      'order.paid': {
        email: {
          subject: 'Order {{ payload.orderId }} paid',
          body: 'Hi {{ userId }}, order {{ payload.orderId }} is now paid.',
        },
        sms: 'Order {{ payload.orderId }} is paid.',
      },
    },
  },
})
```

## Configuration
### Channels
- `email`
- `whatsapp`
- `sms`
- `inapp`

### Template registry
Templates resolve by event key and channel, and can be overridden without modifying core internals.

```ts
const config = {
  templates: {
    registry: {
      'order.shipped': {
        email: {
          subject: 'Order {{ payload.orderId }} shipped',
          body: 'Tracking: {{ payload.trackingNumber }}',
        },
        whatsapp: 'Order {{ payload.orderId }} shipped. Tracking {{ payload.trackingNumber }}.',
      },
    },
  },
}
```

### Preferences, policy, and observability
```ts
const config = {
  preferences: {
    fields: {
      channels: 'notificationPreferences.channels',
      marketingConsent: 'notificationPreferences.marketing',
    },
  },
  policy: {
    canSend: ({ channel, classification, user }) => ({
      allow: !(channel === 'sms' && classification === 'marketing' && user.plan === 'free'),
      reason: 'SMS marketing disabled for free plan',
    }),
  },
  observability: {
    onDispatch: async (event) => {
      console.log(event.type, event.status, event.fingerprint)
    },
  },
}
```

## Reliability helpers
The package exposes helpers to support retry-safe delivery and structured observability.

- `buildDeliveryFingerprint(input)` creates a deterministic deduplication key.
- `classifyDispatchFailure(error)` marks failures as `retriable` or `terminal`.
- `createObservabilityEvent(input)` shapes structured monitoring payloads.
- The send flow blocks duplicate deliveries from already-completed fingerprints.
- Retriable failures are re-queued up to three attempts.

## Testing and CI
```bash
bun test
bun run check
```

See `docs/testing-strategy.md` for coverage expectations and CI guidance.

## Common flows
Starter templates are included for:
- `order.paid`
- `order.shipped`
- `auth.magic-link`

## Migration
If you currently send notifications directly from hooks or services, migrate by:
1. Emitting domain events into the plugin job pipeline.
2. Moving per-channel message text into the template registry.
3. Applying preference and policy checks centrally instead of inline.
4. Using logs and in-app collections for auditability.
5. Attaching an observability hook for metrics or external monitoring.

## Release checklist
- Run tests and fix regressions.
- Verify provider configuration and published exports.
- Review README and examples.
- Confirm release notes and version bump.
- Validate package contents before publishing.
