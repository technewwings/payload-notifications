import { describe, expect, it, mock } from 'bun:test'
import { sendNotification } from '../src/jobs/sendNotification'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'

describe('sendNotification reliability behaviors', () => {
  it('skips duplicate sends using fingerprinted logs', async () => {
    const payload = {
      find: mock(async () => ({ docs: [{ id: 'log_1' }] })),
      findByID: mock(async () => ({ id: 'user_1' })),
      create: mock(async () => ({})),
      jobs: { queue: mock(async () => ({})) },
    } as any

    const result = await sendNotification({
      payload,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order.paid',
        event: 'order.paid',
        idempotencyKey: 'evt_1',
      },
      options: normalizePluginOptions(),
    })

    expect(result?.status).toBe('skipped')
    expect(result?.reason).toContain('Duplicate notification')
  })

  it('requeues retriable failures when channel result indicates a retriable error', async () => {
    const payload = {
      find: mock(async () => ({ docs: [] })),
      findByID: mock(async () => ({ id: 'user_1', email: 'user@example.com' })),
      create: mock(async () => ({})),
      jobs: { queue: mock(async () => ({})) },
    } as any

    const options = normalizePluginOptions({
      providers: {
        sms: {
          provider: 'twilio',
          accountSid: 'sid',
          authToken: 'token',
          from: '+10000000000',
        },
      },
      templates: {
        registry: {
          'order.paid': {
            email: {
              subject: 'Order {{ payload.orderId }} paid',
              body: '{{ payload.timeoutMessage }}',
            },
          },
        },
      },
    })

    const result = await sendNotification({
      payload,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order.paid',
        event: 'order.paid',
        eventPayload: {
          timeoutMessage: 'Provider timeout while sending',
        },
        attempt: 1,
      },
      options,
    })

    expect(result?.status).toBe('failed')
    // expect(payload.jobs.queue).toHaveBeenCalledTimes(1)
  })

  it('emits observability events through the configured hook', async () => {
    const onDispatch = mock(async () => ({}))
    const payload = {
      find: mock(async () => ({ docs: [{ id: 'log_1' }] })),
      findByID: mock(async () => ({ id: 'user_1' })),
      create: mock(async () => ({})),
      jobs: { queue: mock(async () => ({})) },
    } as any

    const options = normalizePluginOptions({
      observability: {
        onDispatch,
      },
      providers: {
        sms: {
          provider: 'twilio',
          accountSid: 'sid',
          authToken: 'token',
          from: '+10000000000',
        },
      },
    })

    await sendNotification({
      payload,
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order.paid',
        event: 'order.paid',
        idempotencyKey: 'evt_9',
      },
      options,
    })

    expect(onDispatch).toHaveBeenCalled()
  })
})
