import type { NotificationsPluginOptions, NormalizedNotificationsPluginOptions } from '../types'
import { getDefaultTemplateRegistry } from '../templates/context'

const DEFAULT_CHANNELS: NormalizedNotificationsPluginOptions['channels'] = [
  'email',
  'whatsapp',
  'sms',
  'inapp',
]

export const normalizePluginOptions = (
  options: NotificationsPluginOptions = {},
): NormalizedNotificationsPluginOptions => {
  return {
    enabled: options.enabled ?? true,
    channels: options.channels?.length ? options.channels : DEFAULT_CHANNELS,
    userCollectionSlug: options.userCollectionSlug || 'users',
    collections: {
      notifications: options.collections?.notifications || 'notifications',
      logs: options.collections?.logs || 'notification-logs',
    },
    templates: {
      email: options.templates?.email,
      whatsapp: options.templates?.whatsapp,
      sms: options.templates?.sms,
      registry: {
        ...getDefaultTemplateRegistry(),
        ...(options.templates?.registry || {}),
      },
    },
    providers: {
      email: options.providers?.email,
      whatsapp: options.providers?.whatsapp,
      sms: options.providers?.sms,
    },
    preferences: {
      fields: {
        channels: options.preferences?.fields?.channels || 'notificationPreferences.channels',
        marketingConsent:
          options.preferences?.fields?.marketingConsent || 'notificationPreferences.marketing',
      },
    },
    policy: {
      canSend: options.policy?.canSend,
    },
    rules: options.rules || [],
  }
}

/**
 * Validates an externally constructed NormalizedNotificationsPluginOptions object.
 * Use this when manually building options outside of normalizePluginOptions().
 */
export const validateNormalizedOptions = (
  options: NormalizedNotificationsPluginOptions,
): NormalizedNotificationsPluginOptions => {
  if (!options.channels.length) {
    throw new Error('payload-notifications: at least one channel must be enabled')
  }

  if (options.channels.includes('sms') && !options.providers.sms?.provider) {
    throw new Error('payload-notifications: providers.sms.provider is required when sms channel is enabled')
  }

  return options
}
