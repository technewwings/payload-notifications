import { describe, expect, it } from 'bun:test'
import { buildCommonEventContext, getContextValue } from '../src/templates/context'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'
import { resolveTemplate, resolveTemplateSync } from '../src/templates/resolve'

describe('template resolution and context helpers', () => {
  it('resolves default order templates by event and channel', async () => {
    const options = normalizePluginOptions()

    const result = await resolveTemplate({
      event: 'order.paid',
      channel: 'email',
      templateKey: 'order.paid',
      options,
    })

    expect(result.templateKey).toBe('order.paid')
    expect(result.definition.subject).toContain('payload.orderId')
    expect(result.definition.body).toContain('paid successfully')
  })

  it('allows registry overrides without changing core internals', async () => {
    const options = normalizePluginOptions({
      templates: {
        registry: {
          'order.paid': {
            sms: 'Custom SMS for {{ payload.orderId }}',
          },
        },
      },
    })

    const result = await resolveTemplate({
      event: 'order.paid',
      channel: 'sms',
      templateKey: 'order.paid',
      options,
    })

    expect(result.definition.body).toBe('Custom SMS for {{ payload.orderId }}')
  })

  it('fails clearly when a template set is missing', async () => {
    const options = normalizePluginOptions()

    await expect(
      resolveTemplate({
        event: 'unknown.event',
        channel: 'email',
        templateKey: 'unknown.event',
        options,
      }),
    ).rejects.toThrow('Template set not found for key: unknown.event')
  })

  it('resolves synchronously via resolveTemplateSync for backward compat', () => {
    const options = normalizePluginOptions()

    const result = resolveTemplateSync({
      event: 'order.paid',
      channel: 'email',
      templateKey: 'order.paid',
      options,
    })

    expect(result.templateKey).toBe('order.paid')
    expect(result.definition.subject).toContain('payload.orderId')
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
