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
export {
  NotificationsCollection,
  buildNotificationMetaField,
} from './collections/Notifications'
export type { NotificationsCollectionOverrides } from './collections/Notifications'
export {
  NotificationLogsCollection,
  buildProviderResponseField,
} from './collections/NotificationLogs'
export type { NotificationLogsCollectionOverrides } from './collections/NotificationLogs'
export { processEvent, resolveRulesForEvent } from './jobs/processEvent'
export { sendNotification } from './jobs/sendNotification'
