export type NotificationChannel = 'email' | 'whatsapp' | 'sms' | 'inapp' | 'push'

export type NotificationClassification = 'transactional' | 'marketing'

export type NotificationEventPayload = Record<string, unknown>

export type NotificationEvent = {
  name: string
  userId?: string
  payload?: NotificationEventPayload
  classification?: NotificationClassification
  idempotencyKey?: string
}

export type NotificationRule = {
  event: string
  channels: NotificationChannel[]
  template: string
  condition?: (payload: NotificationEventPayload) => boolean | Promise<boolean>
}

export type EmailProviderConfig = {
  adapter?: unknown
  defaultFromName?: string
  defaultFromAddress?: string
}

export type WhatsAppProviderConfig = {
  provider: 'twilio' | 'meta'
  accountSid?: string
  authToken?: string
  from?: string
  accessToken?: string
  phoneNumberId?: string
}

export type SMSProviderConfig = {
  provider: 'twilio'
  accountSid?: string
  authToken?: string
  from?: string
}

export type NotificationsPluginOptions = {
  enabled?: boolean
  channels?: NotificationChannel[]
  userCollectionSlug?: string
  collections?: {
    notifications?: string
    logs?: string
  }
  templates?: {
    email?: string
    whatsapp?: string
    sms?: string
  }
  providers?: {
    email?: EmailProviderConfig
    whatsapp?: Partial<WhatsAppProviderConfig>
    sms?: Partial<SMSProviderConfig>
  }
  rules?: NotificationRule[]
}

export type NormalizedNotificationsPluginOptions = {
  enabled: boolean
  channels: NotificationChannel[]
  userCollectionSlug: string
  collections: {
    notifications: string
    logs: string
  }
  templates: {
    email?: string
    whatsapp?: string
    sms?: string
  }
  providers: {
    email?: EmailProviderConfig
    whatsapp?: Partial<WhatsAppProviderConfig>
    sms?: Partial<SMSProviderConfig>
  }
  rules: NotificationRule[]
}

export type NotificationSendInput = {
  userId: string
  channel: NotificationChannel
  template: string
  event: string
  eventPayload?: NotificationEventPayload
  idempotencyKey?: string
}

export type NotificationDispatchResult = {
  channel: NotificationChannel
  status: 'queued' | 'sent' | 'stored' | 'failed' | 'skipped'
  reason?: string
}

export type NotificationQueueTask = {
  slug: 'notification:process-event' | 'notification:send'
}

export type NotificationProcessEventJobInput = NotificationEvent

export type NotificationSendJobInput = NotificationSendInput
