import { describe, expect, it } from 'bun:test'
import { buildCommonEventContext, getContextValue } from '../src/templates/context'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'
import { resolveTemplate } from '../src/templates/resolve'

describe('template resolution and context helpers', () => {
  it('resolves default order templates by event and channel', () => {
    const options = normalizePluginOptions()

    const result = resolveTemplate({
      event: 'order.paid',
      channel: 'email',
      templateKey: 'order.paid',
      options,
    })

    expect(result.templateKey).toBe('order.paid')
    expect(result.definition.subject).toContain('payload.orderId')
    expect(result.definition.body).toContain('paid successfully')
  })

  it('allows registry overrides without changing core internals', () => {
    const options = normalizePluginOptions({
      templates: {
        registry: {
          'order.paid': {
            sms: 'Custom SMS for {{ payload.orderId }}',
          },
        },
      },
    })

    const result = resolveTemplate({
      event: 'order.paid',
      channel: 'sms',
      templateKey: 'order.paid',
      options,
    })

    expect(result.definition.body).toBe('Custom SMS for {{ payload.orderId }}')
  })

  it('fails clearly when a template set is missing', () => {
    const options = normalizePluginOptions()

    expect(() =>
      resolveTemplate({
        event: 'unknown.event',
        channel: 'email',
        templateKey: 'unknown.event',
        options,
      }),
    ).toThrow('Template set not found for key: unknown.event')
  })

  it('supports nested payload lookup in context helpers', () => {
    const context = buildCommonEventContext({
      event: 'order.shipped',
      userId: 'user_1',
      payload: {
        order: {
          items: [{ id: 'item_1' }],
        },
      },
    })

    expect(getContextValue(context, 'payload.order.items.0.id')).toBe('item_1')
  })
})
