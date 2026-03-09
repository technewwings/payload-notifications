import { describe, expect, it, mock } from 'bun:test'
import { sendEmailNotification } from '../src/channels/email'
import { sendInAppNotification } from '../src/channels/inapp'
import { sendSMSNotification } from '../src/channels/sms'
import { sendWhatsAppNotification } from '../src/channels/whatsapp'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'

type MockPayload = {
  findByID?: ReturnType<typeof mock>
  sendEmail?: ReturnType<typeof mock>
  create: ReturnType<typeof mock>
}

const createMockPayload = (overrides: Partial<MockPayload> = {}) => {
  return {
    create: mock(async () => undefined),
    ...overrides,
  }
}

describe('channel implementations', () => {
  it('sends email with rendered template and logs success', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1', email: 'demo@example.com' })),
      sendEmail: mock(async () => undefined),
      create: mock(async () => undefined),
    })

    const result = await sendEmailNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'Hello {{ userId }}',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result.status).toBe('sent')
    expect(result.provider).toBe('payload-email')
    expect(payload.sendEmail).toHaveBeenCalledTimes(1)
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('skips email when user email is missing', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1' })),
      create: mock(async () => undefined),
    })

    const result = await sendEmailNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'Hello {{ userId }}',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result.status).toBe('skipped')
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('returns failed email result when payload email send throws', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1', email: 'demo@example.com' })),
      sendEmail: mock(async () => {
        throw new Error('SMTP unavailable')
      }),
      create: mock(async () => undefined),
    })

    const result = await sendEmailNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'Hello {{ userId }}',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result.status).toBe('failed')
    expect(result.reason).toBe('SMTP unavailable')
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('returns skipped whatsapp result when phone is missing', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1' })),
      create: mock(async () => undefined),
    })

    const result = await sendWhatsAppNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'whatsapp',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions({
        channels: ['whatsapp'],
        providers: {
          whatsapp: {
            provider: 'twilio',
            accountSid: 'sid',
            authToken: 'token',
            from: 'whatsapp:+10000000000',
          },
        },
      }),
    })

    expect(result.status).toBe('skipped')
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('returns failed whatsapp result when provider send throws', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1', phone: '+15550000000' })),
      create: mock(async () => undefined),
    })

    const options = normalizePluginOptions({
      channels: ['whatsapp'],
      providers: {
        whatsapp: {
          provider: 'meta',
        },
      },
    })

    const original = Date.now
    Date.now = () => {
      throw new Error('Provider unavailable')
    }

    const result = await sendWhatsAppNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'whatsapp',
        template: 'order-paid',
        event: 'order.paid',
      },
      options,
    })

    Date.now = original

    expect(result.status).toBe('failed')
    expect(result.reason).toBe('Provider unavailable')
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('returns sent sms result with provider metadata', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1', phone: '+15550000000' })),
      create: mock(async () => undefined),
    })

    const result = await sendSMSNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'sms',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions({
        channels: ['sms'],
        providers: {
          sms: {
            provider: 'twilio',
            accountSid: 'sid',
            authToken: 'token',
            from: '+15551111111',
          },
        },
      }),
    })

    expect(result.status).toBe('sent')
    expect(result.provider).toBe('twilio')
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('returns skipped sms result when phone is missing', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1' })),
      create: mock(async () => undefined),
    })

    const result = await sendSMSNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'sms',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions({
        channels: ['sms'],
      }),
    })

    expect(result.status).toBe('skipped')
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('returns failed sms result when provider send throws', async () => {
    const payload = createMockPayload({
      findByID: mock(async () => ({ id: 'user_1', phone: '+15550000000' })),
      create: mock(async () => undefined),
    })

    const original = Date.now
    Date.now = () => {
      throw new Error('SMS provider unavailable')
    }

    const result = await sendSMSNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'sms',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions({
        channels: ['sms'],
      }),
    })

    Date.now = original

    expect(result.status).toBe('failed')
    expect(result.reason).toBe('SMS provider unavailable')
    expect(payload.create).toHaveBeenCalledTimes(1)
  })

  it('stores in-app notifications and returns stored result', async () => {
    const payload = createMockPayload({
      create: mock(async () => undefined),
    })

    const result = await sendInAppNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'inapp',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result.status).toBe('stored')
    expect(payload.create).toHaveBeenCalledTimes(2)
  })

  it('returns failed in-app result when create throws', async () => {
    const payload = createMockPayload({
      create: mock(async () => {
        throw new Error('Database unavailable')
      }),
    })

    const result = await sendInAppNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'inapp',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result.status).toBe('failed')
    expect(result.reason).toBe('Database unavailable')
  })
})
