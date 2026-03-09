import type { Config } from 'payload'
import type { CollectionConfig } from 'payload'
import type {
  NormalizedNotificationsPluginOptions,
  NotificationQueueTask,
  NotificationsPluginOptions,
} from './types'
import {
  NotificationsCollection,
  type NotificationsCollectionOverrides,
} from './collections/Notifications'
import {
  NotificationLogsCollection,
  type NotificationLogsCollectionOverrides,
} from './collections/NotificationLogs'
import { normalizePluginOptions } from './config/normalizePluginOptions'

const hasCollectionSlug = (collections: CollectionConfig[] = [], slug: string): boolean => {
  return collections.some((collection) => collection.slug === slug)
}

const getExistingTaskSlugs = (config: Config): string[] => {
  const jobsConfig = config.jobs
  if (!jobsConfig || !('tasks' in jobsConfig) || !Array.isArray(jobsConfig.tasks)) {
    return []
  }

  return jobsConfig.tasks
    .map((task) => (task && typeof task === 'object' && 'slug' in task ? String(task.slug) : ''))
    .filter(Boolean)
}

const registerTaskDefinitions = (
  config: Config,
  tasks: NotificationQueueTask[],
): Array<{ slug: string }> => {
  const existing = new Set(getExistingTaskSlugs(config))
  const nextTasks =
    config.jobs && 'tasks' in config.jobs && Array.isArray(config.jobs.tasks)
      ? [...config.jobs.tasks]
      : []

  for (const task of tasks) {
    if (existing.has(task.slug)) continue
    nextTasks.push({ slug: task.slug })
    existing.add(task.slug)
  }

  return nextTasks as Array<{ slug: string }>
}

export const notificationsPlugin = (options: NotificationsPluginOptions = {}) => {
  const normalizedOptions = normalizePluginOptions(options)

  return (config: Config): Config => {
    if (normalizedOptions.enabled === false) {
      return config
    }

    const collections = [...(config.collections || [])]
    const withCollections = registerCollections(collections, normalizedOptions)
    const tasks = registerTaskDefinitions(config, [
      { slug: 'notification:process-event' },
      { slug: 'notification:send' },
    ])

    return {
      ...config,
      collections: withCollections,
      jobs: {
        ...(config.jobs || {}),
        tasks,
      },
    }
  }
}

export const registerCollections = (
  collections: CollectionConfig[],
  options: NormalizedNotificationsPluginOptions,
  overrides?: {
    notifications?: NotificationsCollectionOverrides
    logs?: NotificationLogsCollectionOverrides
  },
): CollectionConfig[] => {
  const next = [...collections]

  if (!hasCollectionSlug(next, options.collections.notifications)) {
    next.push(
      NotificationsCollection({
        userCollectionSlug: options.userCollectionSlug,
        slug: options.collections.notifications,
        overrides: overrides?.notifications,
      }),
    )
  }

  if (!hasCollectionSlug(next, options.collections.logs)) {
    next.push(
      NotificationLogsCollection({
        userCollectionSlug: options.userCollectionSlug,
        slug: options.collections.logs,
        overrides: overrides?.logs,
      }),
    )
  }

  return next
}

export const registerNotificationTasks = registerTaskDefinitions
