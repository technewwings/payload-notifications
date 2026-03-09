import type { Config } from 'payload'
import type { NotificationsPluginOptions } from './types'
import { NotificationsCollection } from './collections/Notifications'
import { NotificationLogsCollection } from './collections/NotificationLogs'

export const notificationsPlugin = (options: NotificationsPluginOptions = {}) => {
  return (config: Config): Config => {
    const userCollectionSlug = options.userCollectionSlug || 'users'

    return {
      ...config,
      collections: [
        ...(config.collections || []),
        NotificationsCollection(userCollectionSlug),
        NotificationLogsCollection(userCollectionSlug),
      ],
      jobs: {
        ...(config.jobs || {}),
        tasks: [
          ...((config.jobs && 'tasks' in config.jobs && Array.isArray(config.jobs.tasks)
            ? config.jobs.tasks
            : []) as any[]),
        ],
      },
    }
  }
}
