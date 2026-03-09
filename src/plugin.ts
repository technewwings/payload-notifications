import type { Config } from 'payload'
import type { CollectionConfig } from 'payload'
import type { NormalizedNotificationsPluginOptions, NotificationsPluginOptions } from './types'
import { NotificationsCollection } from './collections/Notifications'
import { NotificationLogsCollection } from './collections/NotificationLogs'
import { normalizePluginOptions } from './config/normalizePluginOptions'

const hasCollectionSlug = (collections: CollectionConfig[] = [], slug: string): boolean => {
  return collections.some((collection) => collection.slug === slug)
}

export const notificationsPlugin = (options: NotificationsPluginOptions = {}) => {
  const normalizedOptions = normalizePluginOptions(options)

  return (config: Config): Config => {
    if (normalizedOptions.enabled === false) {
      return config
    }

    const collections = [...(config.collections || [])]
    const withCollections = registerCollections(collections, normalizedOptions)

    return {
      ...config,
      collections: withCollections,
      jobs: {
        ...(config.jobs || {}),
      },
    }
  }
}

export const registerCollections = (
  collections: CollectionConfig[],
  options: NormalizedNotificationsPluginOptions,
): CollectionConfig[] => {
  const next = [...collections]

  if (!hasCollectionSlug(next, options.collections.notifications)) {
    next.push(
      NotificationsCollection(options.userCollectionSlug, options.collections.notifications),
    )
  }

  if (!hasCollectionSlug(next, options.collections.logs)) {
    next.push(NotificationLogsCollection(options.userCollectionSlug, options.collections.logs))
  }

  return next
}
