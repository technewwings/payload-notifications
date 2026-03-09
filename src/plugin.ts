import type { Config, Payload } from 'payload'
import type { CollectionConfig } from 'payload'
import type {
  NormalizedNotificationsPluginOptions,
  NotificationQueueTask,
  NotificationsPluginOptions,
} from './types'
import type { TaskConfig, TaskHandler, TaskHandlerArgs, TaskHandlerResult } from 'payload'
import {
  NotificationsCollection,
  type NotificationsCollectionOverrides,
} from './collections/Notifications'
import {
  NotificationLogsCollection,
  type NotificationLogsCollectionOverrides,
} from './collections/NotificationLogs'
import { normalizePluginOptions } from './config/normalizePluginOptions'
import { assertNotificationEvent, processEvent } from './jobs/processEvent'
import { assertNotificationSendInput, sendNotification } from './jobs/sendNotification'

const hasCollectionSlug = (collections: CollectionConfig[] = [], slug: string): boolean => {
  return collections.some((collection) => collection.slug === slug)
}

type RegisteredTask = Pick<TaskConfig<any>, 'slug' | 'handler'>

const getExistingTaskSlugs = (config: Config): string[] => {
  const jobsConfig = config.jobs
  if (!jobsConfig || !('tasks' in jobsConfig) || !Array.isArray(jobsConfig.tasks)) {
    return []
  }

  return jobsConfig.tasks
    .map((task) => (task && typeof task === 'object' && 'slug' in task ? String(task.slug) : ''))
    .filter(Boolean)
}

const createDeferredTaskHandler = (taskSlug: string): TaskHandler<any> => {
  return async (args: TaskHandlerArgs<any>) => {
    return {
      state: 'failed',
      errorMessage: `payload-notifications: task ${taskSlug} must be executed through registered plugin runtime`,
    } as TaskHandlerResult<any>
  }
}

const registerTaskDefinitions = (
  config: Config,
  tasks: NotificationQueueTask[],
): TaskConfig<any>[] => {
  const existing = new Set(getExistingTaskSlugs(config))
  const nextTasks: TaskConfig<any>[] =
    config.jobs && 'tasks' in config.jobs && Array.isArray(config.jobs.tasks)
      ? [...(config.jobs.tasks as TaskConfig<any>[])]
      : []

  for (const task of tasks) {
    if (existing.has(task.slug)) continue

    nextTasks.push({
      slug: task.slug,
      handler: createDeferredTaskHandler(task.slug),
    } as TaskConfig<any>)

    existing.add(task.slug)
  }

  return nextTasks
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
        ...config.jobs,
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

export const createTaskHandlers = (
  payload: Payload,
  options: NormalizedNotificationsPluginOptions,
) => {
  return {
    'notification:process-event': async ({ input }: { input?: unknown }) => {
      const event = assertNotificationEvent(input)
      await processEvent({ payload, event, options })
    },
    'notification:send': async ({ input }: { input?: unknown }) => {
      const sendInput = assertNotificationSendInput(input)
      return sendNotification({ payload, input: sendInput, options })
    },
  }
}
