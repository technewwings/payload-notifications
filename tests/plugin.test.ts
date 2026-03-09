import { describe, expect, it } from 'bun:test'
import { notificationsPlugin } from '../src/plugin'

describe('payload-notifications', () => {
  it('exports notificationsPlugin function', () => {
    expect(typeof notificationsPlugin).toBe('function')
  })

  it('returns a config transformer', () => {
    const plugin = notificationsPlugin({ enabled: true })
    expect(typeof plugin).toBe('function')
  })
})
