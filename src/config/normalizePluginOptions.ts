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
  const userProvidedChannels = options.channels !== undefined

  const channels =
    userProvidedChannels && options.channels?.length
      ? [...new Set(options.channels)]
      : DEFAULT_CHANNELS

  const notificationsSlug = options.collections?.notifications || 'notifications'
  const logsSlug = options.collections?.logs || 'notification-logs'

  if (notificationsSlug === logsSlug) {
    throw new Error('notifications and logs collections must use different slugs')
  }

  if (
    userProvidedChannels &&
    channels.includes('whatsapp') &&
    !options.providers?.whatsapp?.provider
  ) {
    throw new Error('providers.whatsapp.provider is required')
  }

  if (
    userProvidedChannels &&
    channels.includes('sms') &&
    options.providers?.sms?.provider === 'twilio'
  ) {
    const smsConfig = options.providers.sms
    if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.from) {
      throw new Error('Twilio SMS requires accountSid, authToken, and from')
    }
  }

  return {
    enabled: options.enabled ?? true,
    channels,
    userCollectionSlug: options.userCollectionSlug || 'users',
    collections: {
      notifications: notificationsSlug,
      logs: logsSlug,
    },
    templates: {
      email: options.templates?.email,
      whatsapp: options.templates?.whatsapp,
      sms: options.templates?.sms,
      registry: {
        ...getDefaultTemplateRegistry(),
        ...options.templates?.registry,
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
    observability: {
      onDispatch: options.observability?.onDispatch,
    },
    rules: options.rules || [],
  }
}

export const validateNormalizedOptions = (
  options: NormalizedNotificationsPluginOptions,
): NormalizedNotificationsPluginOptions => {
  if (!options.channels.length) {
    throw new Error('payload-notifications: at least one channel must be enabled')
  }

  if (options.channels.includes('sms') && !options.providers.sms?.provider) {
    throw new Error(
      'payload-notifications: providers.sms.provider is required when sms channel is enabled',
    )
  }

  return options
}
