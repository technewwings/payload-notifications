export { notificationsPlugin, registerCollections, registerNotificationTasks } from './plugin'
export { normalizePluginOptions, validateNormalizedOptions } from './config/normalizePluginOptions'
export type {
  EmailProviderConfig,
  NormalizedNotificationsPluginOptions,
  NotificationChannel,
  NotificationClassification,
  NotificationDispatchResult,
  NotificationEvent,
  NotificationEventPayload,
  NotificationQueueTask,
  NotificationRule,
  NotificationSendInput,
  NotificationsPluginOptions,
  SMSProviderConfig,
  WhatsAppProviderConfig,
} from './types'
export { NotificationsCollection } from './collections/Notifications'
export { NotificationLogsCollection } from './collections/NotificationLogs'
export { processEvent, resolveRulesForEvent } from './jobs/processEvent'
export { sendNotification } from './jobs/sendNotification'
