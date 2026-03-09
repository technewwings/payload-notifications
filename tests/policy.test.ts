import { describe, expect, it } from 'bun:test'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'
import { evaluateNotificationPolicy } from '../src/policy/evaluatePolicy'

describe('notification policy evaluation', () => {
  it('allows transactional notifications by default', async () => {
    const result = await evaluateNotificationPolicy({
      user: {},
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order-paid',
        event: 'order.paid',
        classification: 'transactional',
      },
      options: normalizePluginOptions(),
    })

    expect(result.allow).toBe(true)
  })

  it('blocks opted-out channels using mapped preference fields', async () => {
    const result = await evaluateNotificationPolicy({
      user: {
        profile: {
          preferences: {
            channels: {
              sms: false,
            },
          },
        },
      },
      input: {
        userId: 'user_1',
        channel: 'sms',
        template: 'order-paid',
        event: 'order.paid',
        classification: 'transactional',
      },
      options: normalizePluginOptions({
        preferences: {
          fields: {
            channels: 'profile.preferences.channels',
          },
        },
      }),
    })

    expect(result.allow).toBe(false)
    expect(result.reason).toContain('opted out')
  })

  it('blocks marketing notifications without consent', async () => {
    const result = await evaluateNotificationPolicy({
      user: {
        notificationPreferences: {
          marketing: false,
        },
      },
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'promo',
        event: 'campaign.launch',
        classification: 'marketing',
      },
      options: normalizePluginOptions(),
    })

    expect(result.allow).toBe(false)
    expect(result.reason).toContain('not consented')
  })

  it('allows custom policy hooks to deny sends with explicit reasons', async () => {
    const result = await evaluateNotificationPolicy({
      user: {
        role: 'blocked',
      },
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order-paid',
        event: 'order.paid',
        classification: 'transactional',
      },
      options: normalizePluginOptions({
        policy: {
          canSend: ({ user }) => ({
            allow: user.role !== 'blocked',
            reason: 'Blocked by custom policy',
          }),
        },
      }),
    })

    expect(result.allow).toBe(false)
    expect(result.reason).toBe('Blocked by custom policy')
  })
})
