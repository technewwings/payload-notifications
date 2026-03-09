export {
  createTaskHandlers,
  notificationsPlugin,
  registerCollections,
  registerNotificationTasks,
} from './plugin'
export { normalizePluginOptions, validateNormalizedOptions } from './config/normalizePluginOptions'
export type {
  ChannelProviderResult,
  EmailProviderConfig,
  NormalizedNotificationsPluginOptions,
  NotificationChannel,
  NotificationClassification,
  NotificationDispatchResult,
  NotificationDispatchStatus,
  NotificationEvent,
  NotificationEventPayload,
  NotificationPolicyContext,
  NotificationPolicyDecision,
  NotificationProcessEventJobInput,
  NotificationQueueTask,
  NotificationRule,
  NotificationSendInput,
  NotificationSendJobInput,
  NotificationsPluginOptions,
  NotificationTemplateContext,
  NotificationTemplateRenderer,
  PreferenceFieldMapping,
  SMSProviderAdapter,
  SMSProviderConfig,
  SMSProviderSendInput,
  WhatsAppProviderAdapter,
  WhatsAppProviderConfig,
  WhatsAppProviderSendInput,
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
export {
  assertNotificationEvent,
  emitNotificationEvent,
  processEvent,
  resolveRulesForEvent,
} from './jobs/processEvent'
export {
  assertNotificationSendInput,
  queueNotificationSend,
  sendNotification,
} from './jobs/sendNotification'
export { renderTemplate } from './templates/render'
export { createSMSProvider } from './providers/sms'
export { createWhatsAppProvider } from './providers/whatsapp'
export { evaluateNotificationPolicy } from './policy/evaluatePolicy'
