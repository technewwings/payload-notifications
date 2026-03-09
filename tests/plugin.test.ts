import { describe, expect, it } from 'bun:test'
import { notificationsPlugin, registerCollections } from '../src/plugin'
import { normalizePluginOptions } from '../src/config/normalizePluginOptions'

describe('payload-notifications', () => {
  it('exports notificationsPlugin function', () => {
    expect(typeof notificationsPlugin).toBe('function')
  })

  it('returns a config transformer', () => {
    const plugin = notificationsPlugin({ enabled: true })
    expect(typeof plugin).toBe('function')
  })

  it('registers collections once', () => {
    const options = normalizePluginOptions()
    const collections = registerCollections([], options)
    const secondPass = registerCollections(collections, options)

    expect(collections).toHaveLength(2)
    expect(secondPass).toHaveLength(2)
  })

  it('respects custom collection slugs', () => {
    const options = normalizePluginOptions({
      collections: {
        notifications: 'app-notifications',
        logs: 'app-notification-logs',
      },
    })

    const collections = registerCollections([], options)
    expect(collections[0]?.slug).toBe('app-notifications')
    expect(collections[1]?.slug).toBe('app-notification-logs')
  })
})
