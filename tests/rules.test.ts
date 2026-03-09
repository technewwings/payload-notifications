import { describe, expect, it } from 'bun:test'
import { resolveRulesForEvent } from '../src/jobs/processEvent'

describe('resolveRulesForEvent', () => {
  it('returns matching rules for an event', () => {
    const rules = [
      { event: 'order.paid', channels: ['email'], template: 'order-paid' },
      { event: 'order.shipped', channels: ['inapp'], template: 'order-shipped' },
    ]

    const matched = resolveRulesForEvent('order.paid', rules)
    expect(matched).toHaveLength(1)
    expect(matched[0]?.template).toBe('order-paid')
  })
})
