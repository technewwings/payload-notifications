import { describe, expect, it, mock } from 'bun:test'
import { sendEmailNotification } from '../src/channels/email'
import { sendInAppNotification } from '../src/channels/inapp'
import { sendSMSNotification } from '../src/channels/sms'
import { sendWhatsAppNotification } from '../src/channels/whatsapp'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'

describe('channel implementations', () => {
  it('sends email with rendered template and logs success', async () => {
    const findByID = mock(async () => ({ id: 'user_1', email: 'demo@example.com' }))
    const sendEmail = mock(async () => undefined)
    const create = mock(async () => undefined)

    const result = await sendEmailNotification({
      payload: { findByID, sendEmail, create } as never,
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
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('returns failed email result when payload email send throws', async () => {
    const findByID = mock(async () => ({ id: 'user_1', email: 'demo@example.com' }))
    const sendEmail = mock(async () => {
      throw new Error('SMTP unavailable')
    })
    const create = mock(async () => undefined)

    const result = await sendEmailNotification({
      payload: { findByID, sendEmail, create } as never,
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
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('returns skipped whatsapp result when phone is missing', async () => {
    const findByID = mock(async () => ({ id: 'user_1' }))
    const create = mock(async () => undefined)

    const result = await sendWhatsAppNotification({
      payload: { findByID, create } as never,
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
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('returns sent sms result with provider metadata', async () => {
    const findByID = mock(async () => ({ id: 'user_1', phone: '+15550000000' }))
    const create = mock(async () => undefined)

    const result = await sendSMSNotification({
      payload: { findByID, create } as never,
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
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('stores in-app notifications and returns stored result', async () => {
    const create = mock(async () => undefined)

    const result = await sendInAppNotification({
      payload: { create } as never,
      input: {
        userId: 'user_1',
        channel: 'inapp',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result.status).toBe('stored')
    expect(create).toHaveBeenCalledTimes(2)
  })
})
