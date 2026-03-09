import { describe, expect, it, mock } from 'bun:test'
import {
  assertNotificationEvent,
  emitNotificationEvent,
  processEvent,
  resolveRulesForEvent,
} from '../src/jobs/processEvent'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'

describe('processEvent', () => {
  it('returns matching rules for an event', () => {
    const rules = [
      { event: 'order.paid', channels: ['email'], template: 'order-paid' },
      { event: 'order.shipped', channels: ['inapp'], template: 'order-shipped' },
    ]

    const matched = resolveRulesForEvent('order.paid', rules)
    expect(matched).toHaveLength(1)
    expect(matched[0]?.template).toBe('order-paid')
  })

  it('validates notification event input', () => {
    const event = assertNotificationEvent({
      name: 'order.paid',
      userId: 'user_1',
      payload: { orderId: 'ord_1' },
    })

    expect(event.name).toBe('order.paid')
    expect(event.userId).toBe('user_1')
  })

  it('queues one send job per matching enabled channel', async () => {
    const queue = mock(async () => undefined)
    const payload = {
      jobs: {
        queue,
      },
      create: mock(async () => undefined),
    }

    const options = normalizePluginOptions({
      channels: ['email', 'inapp'],
      rules: [
        {
          event: 'order.paid',
          channels: ['email', 'inapp'],
          template: 'order-paid',
        },
      ],
    })

    await processEvent({
      payload: payload as never,
      event: {
        name: 'order.paid',
        userId: 'user_1',
        payload: { orderId: 'ord_1' },
      },
      options,
    })

    expect(queue).toHaveBeenCalledTimes(2)
  })

  it('respects async rule conditions', async () => {
    const queue = mock(async () => undefined)
    const payload = {
      jobs: {
        queue,
      },
      create: mock(async () => undefined),
    }

    const options = normalizePluginOptions({
      channels: ['email'],
      rules: [
        {
          event: 'order.paid',
          channels: ['email'],
          template: 'order-paid',
          condition: async (payload) => payload.orderId === 'ord_1',
        },
      ],
    })

    await processEvent({
      payload: payload as never,
      event: {
        name: 'order.paid',
        userId: 'user_1',
        payload: { orderId: 'ord_1' },
      },
      options,
    })

    expect(queue).toHaveBeenCalledTimes(1)
  })

  it('logs useful diagnostics when userId is missing', async () => {
    const queue = mock(async () => undefined)
    const create = mock(async () => undefined)
    const payload = {
      jobs: {
        queue,
      },
      create,
    }

    const options = normalizePluginOptions({
      channels: ['email'],
      rules: [
        {
          event: 'order.paid',
          channels: ['email'],
          template: 'order-paid',
        },
      ],
    })

    await processEvent({
      payload: payload as never,
      event: {
        name: 'order.paid',
      },
      options,
    })

    expect(queue).toHaveBeenCalledTimes(0)
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('queues process-event through emitNotificationEvent helper', async () => {
    const queue = mock(async () => undefined)
    const payload = {
      jobs: {
        queue,
      },
    }

    await emitNotificationEvent({
      payload: payload as never,
      event: {
        name: 'order.paid',
        userId: 'user_1',
      },
    })

    expect(queue).toHaveBeenCalledTimes(1)
  })
})
