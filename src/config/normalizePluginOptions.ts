import type {
  NormalizedNotificationsPluginOptions,
  NotificationChannel,
  NotificationsPluginOptions,
} from '../types'

const DEFAULT_CHANNELS: NotificationChannel[] = ['email', 'inapp']

export const normalizePluginOptions = (
  options: NotificationsPluginOptions = {},
): NormalizedNotificationsPluginOptions => {
  const normalized: NormalizedNotificationsPluginOptions = {
    enabled: options.enabled ?? true,
    channels: dedupeChannels(options.channels?.length ? options.channels : DEFAULT_CHANNELS),
    userCollectionSlug: options.userCollectionSlug || 'users',
    collections: {
      notifications: options.collections?.notifications || 'notifications',
      logs: options.collections?.logs || 'notification-logs',
    },
    templates: {
      email: options.templates?.email,
      whatsapp: options.templates?.whatsapp,
      sms: options.templates?.sms,
    },
    providers: {
      email: options.providers?.email,
      whatsapp: options.providers?.whatsapp,
      sms: options.providers?.sms,
    },
    rules: options.rules || [],
  }

  validateNormalizedOptions(normalized)

  return normalized
}

const dedupeChannels = (channels: NotificationChannel[]): NotificationChannel[] => {
  return [...new Set(channels)]
}

export const validateNormalizedOptions = (
  options: NormalizedNotificationsPluginOptions,
): void => {
  if (!options.userCollectionSlug.trim()) {
    throw new Error('payload-notifications: userCollectionSlug must not be empty')
  }

  if (!options.collections.notifications.trim()) {
    throw new Error('payload-notifications: collections.notifications must not be empty')
  }

  if (!options.collections.logs.trim()) {
    throw new Error('payload-notifications: collections.logs must not be empty')
  }

  if (options.collections.notifications === options.collections.logs) {
    throw new Error(
      'payload-notifications: notifications and logs collections must use different slugs',
    )
  }

  if (options.channels.includes('whatsapp')) {
    validateWhatsAppConfig(options)
  }

  if (options.channels.includes('sms')) {
    validateSMSConfig(options)
  }
}

const validateWhatsAppConfig = (options: NormalizedNotificationsPluginOptions): void => {
  const provider = options.providers.whatsapp

  if (!provider?.provider) {
    throw new Error(
      'payload-notifications: providers.whatsapp.provider is required when whatsapp channel is enabled',
    )
  }

  if (provider.provider === 'twilio') {
    if (!provider.accountSid || !provider.authToken || !provider.from) {
      throw new Error(
        'payload-notifications: Twilio WhatsApp requires accountSid, authToken, and from',
      )
    }
  }

  if (provider.provider === 'meta') {
    if (!provider.accessToken || !provider.phoneNumberId) {
      throw new Error(
        'payload-notifications: Meta WhatsApp requires accessToken and phoneNumberId',
      )
    }
  }
}

const validateSMSConfig = (options: NormalizedNotificationsPluginOptions): void => {
  const provider = options.providers.sms

  if (!provider?.provider) {
    throw new Error(
      'payload-notifications: providers.sms.provider is required when sms channel is enabled',
    )
  }

  if (provider.provider === 'twilio') {
    if (!provider.accountSid || !provider.authToken || !provider.from) {
      throw new Error('payload-notifications: Twilio SMS requires accountSid, authToken, and from')
    }
  }
}
