import { describe, expect, it, mock } from 'bun:test'
import {
  createTaskHandlers,
  notificationsPlugin,
  registerCollections,
  registerNotificationTasks,
} from '../src/plugin'
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

  it('allows collection overrides during registration', () => {
    const options = normalizePluginOptions()
    const collections = registerCollections([], options, {
      notifications: {
        admin: {
          useAsTitle: 'message',
        },
      },
    })

    expect(collections[0]?.admin?.useAsTitle).toBe('message')
  })

  it('registers notification tasks once', () => {
    const first = registerNotificationTasks({}, [
      { slug: 'notification:process-event' },
      { slug: 'notification:send' },
    ])

    const second = registerNotificationTasks(
      {
        jobs: {
          tasks: first,
        },
      },
      [{ slug: 'notification:process-event' }, { slug: 'notification:send' }],
    )

    expect(first).toHaveLength(2)
    expect(second).toHaveLength(2)
  })

  it('adds collections and tasks through plugin transformer', () => {
    const plugin = notificationsPlugin()
    const config = plugin({ collections: [] })

    expect(config.collections).toHaveLength(2)
    expect(config.jobs && 'tasks' in config.jobs ? config.jobs.tasks : []).toHaveLength(2)
  })

  it('creates runnable task handlers for process-event and send', async () => {
    const queue = mock(async () => undefined)
    const create = mock(async () => undefined)
    const findByID = mock(async () => ({ id: 'user_1', email: 'demo@example.com' }))
    const sendEmail = mock(async () => undefined)

    const payload = {
      jobs: { queue },
      create,
      findByID,
      sendEmail,
    }

    const handlers = createTaskHandlers(
      payload as never,
      normalizePluginOptions({
        rules: [
          {
            event: 'order.paid',
            channels: ['email'],
            template: 'order.paid',
          },
        ],
      }),
    )

    await handlers['notification:process-event']({
      input: {
        name: 'order.paid',
        userId: 'user_1',
      },
    })

    await handlers['notification:send']({
      input: {
        userId: 'user_1',
        channel: 'email',
        template: 'order.paid',
        event: 'order.paid',
      },
    })

    expect(queue).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })
})
