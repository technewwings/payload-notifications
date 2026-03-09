import { describe, expect, it } from 'bun:test'
import { payloadNotifications } from '../src/plugin'

describe('payload-notifications', () => {
  it('should export payloadNotifications function', () => {
    expect(typeof payloadNotifications).toBe('function')
  })

  it('should return a config function', () => {
    const plugin = payloadNotifications({ enabled: true })
    expect(typeof plugin).toBe('function')
  })
})
