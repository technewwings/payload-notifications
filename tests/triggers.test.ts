import { describe, expect, it, mock } from 'bun:test'
import { defineTrigger } from '../src/triggers'
import { resolveRulesForEvent } from '../src/jobs/processEvent'

describe('triggers', () => {
  describe('defineTrigger', () => {
    it('creates a valid trigger definition', () => {
      const trigger = defineTrigger({
        event: 'order.paid',
        channels: ['email', 'inapp'],
        template: 'order.paid',
      })

      expect(trigger.event).toBe('order.paid')
      expect(trigger.channels).toEqual(['email', 'inapp'])
      expect(trigger.template).toBe('order.paid')
      expect(trigger.enabled).toBe(true)
    })

    it('defaults enabled to true', () => {
      const trigger = defineTrigger({
        event: 'test',
        channels: ['email'],
        template: 'test',
      })

      expect(trigger.enabled).toBe(true)
    })

    it('respects explicit enabled=false', () => {
      const trigger = defineTrigger({
        event: 'test',
        channels: ['email'],
        template: 'test',
        enabled: false,
      })

      expect(trigger.enabled).toBe(false)
    })

    it('preserves condition function', () => {
      const condition = mock(async () => true)
      const trigger = defineTrigger({
        event: 'test',
        channels: ['email'],
        template: 'test',
        condition,
      })

      expect(trigger.condition).toBe(condition)
    })

    it('preserves templateOverrides', () => {
      const trigger = defineTrigger({
        event: 'order.paid',
        channels: ['email'],
        template: 'order.paid',
        templateOverrides: {
          email: { subject: 'Custom subject' },
        },
      })

      expect(trigger.templateOverrides?.email?.subject).toBe('Custom subject')
    })

    it('throws when event is missing', () => {
      expect(() =>
        defineTrigger({
          event: '',
          channels: ['email'],
          template: 'test',
        }),
      ).toThrow('trigger requires an event name')
    })

    it('throws when channels are empty', () => {
      expect(() =>
        defineTrigger({
          event: 'test',
          channels: [],
          template: 'test',
        }),
      ).toThrow('trigger requires at least one channel')
    })

    it('throws when template is missing', () => {
      expect(() =>
        defineTrigger({
          event: 'test',
          channels: ['email'],
          template: '',
        }),
      ).toThrow('trigger requires a template key')
    })
  })

  describe('resolveRulesForEvent with enabled flag', () => {
    it('filters out disabled rules', () => {
      const rules = [
        {
          event: 'order.paid',
          channels: ['email' as const],
          template: 'order.paid',
          enabled: true,
        },
        { event: 'order.paid', channels: ['sms' as const], template: 'order.paid', enabled: false },
        { event: 'order.paid', channels: ['inapp' as const], template: 'order.paid' },
      ]

      const matched = resolveRulesForEvent('order.paid', rules)
      expect(matched).toHaveLength(2)
      expect(matched[0].channels).toEqual(['email'])
      expect(matched[1].channels).toEqual(['inapp'])
    })

    it('includes rules without enabled field (defaults to enabled)', () => {
      const rules = [{ event: 'test', channels: ['email' as const], template: 'test' }]

      const matched = resolveRulesForEvent('test', rules)
      expect(matched).toHaveLength(1)
    })
  })
})
