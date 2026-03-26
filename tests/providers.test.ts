import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test'
import { createMetaWhatsAppProvider } from '../src/providers/meta-whatsapp'
import { createTwilioSMSProvider } from '../src/providers/twilio-sms'
import { createTwilioWhatsAppProvider } from '../src/providers/twilio-whatsapp'
import { createWhatsAppProvider } from '../src/providers/whatsapp'
import { createSMSProvider } from '../src/providers/sms'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'
import type { NormalizedNotificationsPluginOptions } from '../src/types'

const originalFetch = globalThis.fetch

const createMockFetch = (responseBody: unknown, status = 200) => {
  return mock(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => responseBody,
  })) as unknown as typeof fetch
}

const metaOptions = normalizePluginOptions({
  channels: ['whatsapp'],
  providers: {
    whatsapp: {
      provider: 'meta',
      accessToken: 'test-access-token',
      phoneNumberId: '123456789',
    },
  },
})

const twilioWhatsAppOptions = normalizePluginOptions({
  channels: ['whatsapp'],
  providers: {
    whatsapp: {
      provider: 'twilio',
      accountSid: 'ACtest123',
      authToken: 'test-auth-token',
      from: 'whatsapp:+15551234567',
    },
  },
})

const twilioSMSOptions = normalizePluginOptions({
  channels: ['sms'],
  providers: {
    sms: {
      provider: 'twilio',
      accountSid: 'ACtest123',
      authToken: 'test-auth-token',
      from: '+15551234567',
    },
  },
})

const sendInput = {
  to: '+15559876543',
  template: 'Hello from test',
  context: { event: 'order.paid', userId: 'user_1' },
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('Meta WhatsApp Cloud API provider', () => {
  it('sends a text message and returns provider result', async () => {
    globalThis.fetch = createMockFetch({
      messaging_product: 'whatsapp',
      contacts: [{ input: '+15559876543', wa_id: '15559876543' }],
      messages: [{ id: 'wamid.abc123' }],
    })

    const provider = createMetaWhatsAppProvider(metaOptions)
    const result = await provider.send(sendInput)

    expect(result.provider).toBe('meta')
    expect(result.messageId).toBe('wamid.abc123')
    expect(result.response?.to).toBe('15559876543')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    const [url, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    expect(url).toContain('123456789/messages')
    expect(url).toContain('graph.facebook.com')
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer test-access-token',
    )
    const body = JSON.parse(init.body as string)
    expect(body.messaging_product).toBe('whatsapp')
    expect(body.to).toBe('+15559876543')
    expect(body.type).toBe('text')
    expect(body.text.body).toBe('Hello from test')
  })

  it('strips whatsapp: prefix from phone numbers', async () => {
    globalThis.fetch = createMockFetch({
      messaging_product: 'whatsapp',
      contacts: [{ input: '+15559876543', wa_id: '15559876543' }],
      messages: [{ id: 'wamid.abc456' }],
    })

    const provider = createMetaWhatsAppProvider(metaOptions)
    await provider.send({ ...sendInput, to: 'whatsapp:+15559876543' })

    const [, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    const body = JSON.parse(init.body as string)
    expect(body.to).toBe('+15559876543')
  })

  it('throws on API error response', async () => {
    globalThis.fetch = createMockFetch(
      {
        error: {
          message: 'Invalid access token',
          type: 'OAuthException',
          code: 190,
        },
      },
      401,
    )

    const provider = createMetaWhatsAppProvider(metaOptions)
    await expect(provider.send(sendInput)).rejects.toThrow('Invalid access token')
  })

  it('throws on non-ok status without error body', async () => {
    globalThis.fetch = createMockFetch({}, 500)

    const provider = createMetaWhatsAppProvider(metaOptions)
    await expect(provider.send(sendInput)).rejects.toThrow(
      'Meta WhatsApp API returned 500',
    )
  })

  it('throws when accessToken is missing', () => {
    const options = {
      ...metaOptions,
      providers: {
        ...metaOptions.providers,
        whatsapp: { provider: 'meta' as const, phoneNumberId: '123' },
      },
    }
    expect(() => createMetaWhatsAppProvider(options)).toThrow(
      'Meta WhatsApp Cloud API requires providers.whatsapp.accessToken',
    )
  })

  it('throws when phoneNumberId is missing', () => {
    const options = {
      ...metaOptions,
      providers: {
        ...metaOptions.providers,
        whatsapp: { provider: 'meta' as const, accessToken: 'token' },
      },
    }
    expect(() => createMetaWhatsAppProvider(options)).toThrow(
      'Meta WhatsApp Cloud API requires providers.whatsapp.phoneNumberId',
    )
  })
})

describe('Twilio SMS provider', () => {
  it('sends an SMS and returns provider result', async () => {
    globalThis.fetch = createMockFetch({
      sid: 'SM12345',
      status: 'queued',
      to: '+15559876543',
      from: '+15551234567',
    })

    const provider = createTwilioSMSProvider(twilioSMSOptions)
    const result = await provider.send(sendInput)

    expect(result.provider).toBe('twilio')
    expect(result.messageId).toBe('SM12345')
    expect(result.response?.status).toBe('queued')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    const [url, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    expect(url).toContain('ACtest123/Messages.json')
    expect(url).toContain('api.twilio.com')
    expect((init.headers as Record<string, string>).Authorization).toStartWith('Basic ')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/x-www-form-urlencoded',
    )

    const body = new URLSearchParams(init.body as string)
    expect(body.get('To')).toBe('+15559876543')
    expect(body.get('From')).toBe('+15551234567')
    expect(body.get('Body')).toBe('Hello from test')
  })

  it('throws on Twilio error response', async () => {
    globalThis.fetch = createMockFetch(
      {
        error_code: 21211,
        error_message: "The 'To' number is not a valid phone number.",
      },
      400,
    )

    const provider = createTwilioSMSProvider(twilioSMSOptions)
    await expect(provider.send(sendInput)).rejects.toThrow(
      "The 'To' number is not a valid phone number.",
    )
  })

  it('throws on non-ok status without error_message', async () => {
    globalThis.fetch = createMockFetch({}, 500)

    const provider = createTwilioSMSProvider(twilioSMSOptions)
    await expect(provider.send(sendInput)).rejects.toThrow('Twilio API returned 500')
  })

  it('throws when accountSid is missing', () => {
    const options = {
      ...twilioSMSOptions,
      providers: {
        ...twilioSMSOptions.providers,
        sms: { provider: 'twilio' as const, authToken: 'token', from: '+1555' },
      },
    }
    expect(() => createTwilioSMSProvider(options)).toThrow(
      'Twilio SMS requires providers.sms.accountSid',
    )
  })

  it('throws when authToken is missing', () => {
    const options = {
      ...twilioSMSOptions,
      providers: {
        ...twilioSMSOptions.providers,
        sms: { provider: 'twilio' as const, accountSid: 'sid', from: '+1555' },
      },
    }
    expect(() => createTwilioSMSProvider(options)).toThrow(
      'Twilio SMS requires providers.sms.authToken',
    )
  })

  it('throws when from is missing', () => {
    const options = {
      ...twilioSMSOptions,
      providers: {
        ...twilioSMSOptions.providers,
        sms: { provider: 'twilio' as const, accountSid: 'sid', authToken: 'token' },
      },
    }
    expect(() => createTwilioSMSProvider(options)).toThrow(
      'Twilio SMS requires providers.sms.from',
    )
  })

  it('encodes basic auth credentials correctly', async () => {
    globalThis.fetch = createMockFetch({ sid: 'SM1', status: 'queued' })

    const provider = createTwilioSMSProvider(twilioSMSOptions)
    await provider.send(sendInput)

    const [, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    const expected = Buffer.from('ACtest123:test-auth-token').toString('base64')
    expect((init.headers as Record<string, string>).Authorization).toBe(`Basic ${expected}`)
  })
})

describe('Twilio WhatsApp provider', () => {
  it('sends a WhatsApp message via Twilio and returns provider result', async () => {
    globalThis.fetch = createMockFetch({
      sid: 'SM67890',
      status: 'queued',
      to: 'whatsapp:+15559876543',
      from: 'whatsapp:+15551234567',
    })

    const provider = createTwilioWhatsAppProvider(twilioWhatsAppOptions)
    const result = await provider.send(sendInput)

    expect(result.provider).toBe('twilio')
    expect(result.messageId).toBe('SM67890')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)

    const [url, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    expect(url).toContain('ACtest123/Messages.json')

    const body = new URLSearchParams(init.body as string)
    expect(body.get('To')).toBe('whatsapp:+15559876543')
    expect(body.get('From')).toBe('whatsapp:+15551234567')
    expect(body.get('Body')).toBe('Hello from test')
  })

  it('prepends whatsapp: prefix to phone numbers without it', async () => {
    globalThis.fetch = createMockFetch({ sid: 'SM1', status: 'queued' })

    const provider = createTwilioWhatsAppProvider(twilioWhatsAppOptions)
    await provider.send({ ...sendInput, to: '+15559876543' })

    const [, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    const body = new URLSearchParams(init.body as string)
    expect(body.get('To')).toBe('whatsapp:+15559876543')
  })

  it('does not double-prefix whatsapp: numbers', async () => {
    globalThis.fetch = createMockFetch({ sid: 'SM1', status: 'queued' })

    const provider = createTwilioWhatsAppProvider(twilioWhatsAppOptions)
    await provider.send({ ...sendInput, to: 'whatsapp:+15559876543' })

    const [, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
      string,
      RequestInit,
    ]
    const body = new URLSearchParams(init.body as string)
    expect(body.get('To')).toBe('whatsapp:+15559876543')
  })

  it('throws on Twilio error response', async () => {
    globalThis.fetch = createMockFetch(
      {
        error_code: 63001,
        error_message: 'Channel not enabled for WhatsApp',
      },
      400,
    )

    const provider = createTwilioWhatsAppProvider(twilioWhatsAppOptions)
    await expect(provider.send(sendInput)).rejects.toThrow(
      'Channel not enabled for WhatsApp',
    )
  })

  it('throws when accountSid is missing', () => {
    const options = {
      ...twilioWhatsAppOptions,
      providers: {
        ...twilioWhatsAppOptions.providers,
        whatsapp: { provider: 'twilio' as const, authToken: 'token', from: '+1' },
      },
    }
    expect(() => createTwilioWhatsAppProvider(options)).toThrow(
      'Twilio WhatsApp requires providers.whatsapp.accountSid',
    )
  })
})

describe('WhatsApp provider factory', () => {
  it('returns Meta provider when provider is meta', () => {
    globalThis.fetch = createMockFetch({})
    const provider = createWhatsAppProvider(metaOptions)
    expect(provider).toBeDefined()
    expect(provider.send).toBeInstanceOf(Function)
  })

  it('returns Twilio provider when provider is twilio', () => {
    globalThis.fetch = createMockFetch({})
    const provider = createWhatsAppProvider(twilioWhatsAppOptions)
    expect(provider).toBeDefined()
    expect(provider.send).toBeInstanceOf(Function)
  })

  it('throws for unsupported provider', () => {
    const options = {
      ...metaOptions,
      providers: {
        ...metaOptions.providers,
        whatsapp: { provider: 'vonage' as 'meta' },
      },
    }
    expect(() => createWhatsAppProvider(options)).toThrow(
      'Unsupported WhatsApp provider: vonage',
    )
  })

  it('throws when no provider is set', () => {
    const options = {
      ...metaOptions,
      providers: {
        ...metaOptions.providers,
        whatsapp: {} as NormalizedNotificationsPluginOptions['providers']['whatsapp'],
      },
    }
    expect(() => createWhatsAppProvider(options)).toThrow('Unsupported WhatsApp provider')
  })
})

describe('SMS provider factory', () => {
  it('returns Twilio provider when provider is twilio', () => {
    globalThis.fetch = createMockFetch({})
    const provider = createSMSProvider(twilioSMSOptions)
    expect(provider).toBeDefined()
    expect(provider.send).toBeInstanceOf(Function)
  })

  it('throws for unsupported provider', () => {
    const options = {
      ...twilioSMSOptions,
      providers: {
        ...twilioSMSOptions.providers,
        sms: { provider: 'vonage' as 'twilio' },
      },
    }
    expect(() => createSMSProvider(options)).toThrow('Unsupported SMS provider: vonage')
  })
})

describe('config validation for provider credentials', () => {
  it('throws when Meta WhatsApp config is missing accessToken', () => {
    expect(() =>
      normalizePluginOptions({
        channels: ['whatsapp'],
        providers: {
          whatsapp: {
            provider: 'meta',
            phoneNumberId: '123',
          },
        },
      }),
    ).toThrow('Meta WhatsApp Cloud API requires')
  })

  it('throws when Meta WhatsApp config is missing phoneNumberId', () => {
    expect(() =>
      normalizePluginOptions({
        channels: ['whatsapp'],
        providers: {
          whatsapp: {
            provider: 'meta',
            accessToken: 'token',
          },
        },
      }),
    ).toThrow('Meta WhatsApp Cloud API requires')
  })

  it('accepts valid Meta WhatsApp config', () => {
    const options = normalizePluginOptions({
      channels: ['whatsapp'],
      providers: {
        whatsapp: {
          provider: 'meta',
          accessToken: 'test-token',
          phoneNumberId: '123456',
        },
      },
    })
    expect(options.providers.whatsapp?.provider).toBe('meta')
    expect(options.providers.whatsapp?.accessToken).toBe('test-token')
  })

  it('throws when Twilio WhatsApp config is missing credentials', () => {
    expect(() =>
      normalizePluginOptions({
        channels: ['whatsapp'],
        providers: {
          whatsapp: {
            provider: 'twilio',
            accountSid: 'sid',
          },
        },
      }),
    ).toThrow('Twilio WhatsApp requires')
  })

  it('accepts valid Twilio WhatsApp config', () => {
    const options = normalizePluginOptions({
      channels: ['whatsapp'],
      providers: {
        whatsapp: {
          provider: 'twilio',
          accountSid: 'sid',
          authToken: 'token',
          from: 'whatsapp:+15551234567',
        },
      },
    })
    expect(options.providers.whatsapp?.provider).toBe('twilio')
  })
})
