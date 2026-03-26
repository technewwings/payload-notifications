# @wtree/payload-notifications

Production-ready notifications plugin for Payload CMS with an event-driven, multi-channel architecture for email, WhatsApp, SMS, and in-app delivery.

## Features
- Event-to-rule notification dispatch through Payload jobs
- Channel implementations for email, WhatsApp, SMS, and in-app notifications
- **Real provider integrations**: Meta WhatsApp Cloud API, Twilio SMS, and Twilio WhatsApp
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

## Supported providers

### Meta WhatsApp Cloud API

Send WhatsApp messages through the [Meta Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api). This is the recommended approach for WhatsApp — it uses Meta's official API directly without a third-party intermediary.

**Prerequisites:**
1. A [Meta Business account](https://business.facebook.com/) with a verified WhatsApp Business Profile.
2. A registered WhatsApp Business phone number and its Phone Number ID (found in the Meta App Dashboard under WhatsApp > API Setup).
3. A permanent System User access token with the `whatsapp_business_messaging` permission (or a temporary token for testing).

**Configuration:**
```ts
notificationsPlugin({
  channels: ['whatsapp'],
  providers: {
    whatsapp: {
      provider: 'meta',
      accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID,
    },
  },
})
```

**Environment variables:**
| Variable | Description |
|---|---|
| `META_WHATSAPP_ACCESS_TOKEN` | System User access token with `whatsapp_business_messaging` permission |
| `META_WHATSAPP_PHONE_NUMBER_ID` | Phone Number ID from the Meta App Dashboard |

**Limitations:**
- Only text messages are supported in this release. Template messages, media, interactive buttons, and list messages are not yet supported.
- The Meta Cloud API has rate limits that vary by tier. See [Meta's throughput documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/overview#throughput).
- Messages to users must be initiated within 24 hours of the user's last message, or you must use a pre-approved message template (Meta policy).
- The access token must be kept secure. Use environment variables, never hardcode tokens.

### Twilio SMS

Send SMS messages through [Twilio's Programmable Messaging API](https://www.twilio.com/docs/messaging).

**Configuration:**
```ts
notificationsPlugin({
  channels: ['sms'],
  providers: {
    sms: {
      provider: 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_SMS_FROM,
    },
  },
})
```

**Environment variables:**
| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID (starts with `AC`) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_SMS_FROM` | Sender phone number in E.164 format (e.g. `+15551234567`) |

### Twilio WhatsApp

Send WhatsApp messages through [Twilio's WhatsApp API](https://www.twilio.com/docs/whatsapp).

**Configuration:**
```ts
notificationsPlugin({
  channels: ['whatsapp'],
  providers: {
    whatsapp: {
      provider: 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_WHATSAPP_FROM,
    },
  },
})
```

**Environment variables:**
| Variable | Description |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender number with `whatsapp:` prefix (e.g. `whatsapp:+15551234567`) |

### Email (built-in)

Email uses Payload CMS's built-in email system. No external provider is needed — configure your SMTP/transport in the Payload config as usual.

```ts
notificationsPlugin({
  channels: ['email'],
  providers: {
    email: {
      defaultFromAddress: 'noreply@example.com',
      defaultFromName: 'My App',
    },
  },
})
```

### In-App (built-in)

In-app notifications are stored in the `notifications` collection and require no external provider.

## Configuration
### Channels
- `email` — via Payload CMS built-in email
- `whatsapp` — via Meta Cloud API or Twilio
- `sms` — via Twilio
- `inapp` — stored in the notifications collection

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

## Provider configuration reference

| Provider | Channel | Required fields |
|---|---|---|
| `meta` | `whatsapp` | `accessToken`, `phoneNumberId` |
| `twilio` | `whatsapp` | `accountSid`, `authToken`, `from` |
| `twilio` | `sms` | `accountSid`, `authToken`, `from` |

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
