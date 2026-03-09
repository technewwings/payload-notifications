import { describe, expect, it, mock } from 'bun:test'
import {
  assertNotificationSendInput,
  queueNotificationSend,
  sendNotification,
} from '../src/jobs/sendNotification'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'

describe('sendNotification', () => {
  it('validates send input', () => {
    const input = assertNotificationSendInput({
      userId: 'user_1',
      channel: 'email',
      template: 'order-paid',
      event: 'order.paid',
    })

    expect(input.channel).toBe('email')
  })

  it('queues sends through helper API', async () => {
    const queue = mock(async () => undefined)
    const payload = {
      jobs: {
        queue,
      },
    }

    await queueNotificationSend({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order-paid',
        event: 'order.paid',
      },
    })

    expect(queue).toHaveBeenCalledTimes(1)
  })

  it('dispatches email notifications and writes a sent log', async () => {
    const sendEmail = mock(async () => undefined)
    const create = mock(async () => undefined)
    const findByID = mock(async () => ({ id: 'user_1', email: 'demo@example.com' }))
    const payload = {
      sendEmail,
      create,
      findByID,
    }

    const result = await sendNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result?.status).toBe('sent')
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('stores in-app notifications and logs them', async () => {
    const create = mock(async () => undefined)
    const findByID = mock(async () => ({ id: 'user_1', email: 'demo@example.com' }))
    const payload = {
      create,
      findByID,
    }

    const result = await sendNotification({
      payload: payload as never,
      input: {
        userId: 'user_1',
        channel: 'inapp',
        template: 'order-paid',
        event: 'order.paid',
      },
      options: normalizePluginOptions(),
    })

    expect(result?.status).toBe('stored')
    expect(create).toHaveBeenCalledTimes(2)
  })
})
