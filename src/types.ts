export type NotificationChannel = 'email' | 'whatsapp' | 'sms' | 'inapp' | 'push'

export type NotificationEvent = {
  name: string
  userId?: string
  payload?: Record<string, unknown>
}

export type NotificationRule = {
  event: string
  channels: NotificationChannel[]
  template: string
  condition?: (payload: Record<string, unknown>) => boolean | Promise<boolean>
}

export type EmailProviderConfig = {
  adapter?: unknown
  defaultFromName?: string
  defaultFromAddress?: string
}

export type WhatsAppProviderConfig = {
  provider?: 'twilio' | 'meta'
  accountSid?: string
  authToken?: string
  from?: string
  accessToken?: string
  phoneNumberId?: string
}

export type SMSProviderConfig = {
  provider?: 'twilio'
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
    whatsapp?: WhatsAppProviderConfig
    sms?: SMSProviderConfig
  }
  rules?: NotificationRule[]
}

export type NotificationSendInput = {
  userId: string
  channel: NotificationChannel
  template: string
  event: string
  eventPayload?: Record<string, unknown>
}
