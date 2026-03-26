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
  NotificationTemplateDefinition,
  NotificationTemplateRecord,
  NotificationTemplateRegistry,
  NotificationTemplateRenderer,
  NotificationTemplateResolution,
  NotificationTemplateResolver,
  NotificationTemplateSet,
  NotificationTriggerDefinition,
  PreferenceFieldMapping,
  RenderedTemplate,
  SMSProviderAdapter,
  SMSProviderConfig,
  SMSProviderSendInput,
  WhatsAppProviderAdapter,
  WhatsAppProviderConfig,
  WhatsAppProviderSendInput,
} from './types'
export { NotificationsCollection, buildNotificationMetaField } from './collections/Notifications'
export type { NotificationsCollectionOverrides } from './collections/Notifications'
export {
  NotificationLogsCollection,
  buildProviderResponseField,
} from './collections/NotificationLogs'
export type { NotificationLogsCollectionOverrides } from './collections/NotificationLogs'
export { NotificationTemplatesCollection } from './collections/NotificationTemplates'
export type { NotificationTemplatesCollectionOverrides } from './collections/NotificationTemplates'
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
export { evaluateNotificationPolicy } from './policy/evaluatePolicy'
export { createSMSProvider } from './providers/sms'
export { createWhatsAppProvider } from './providers/whatsapp'
export { createMetaWhatsAppProvider } from './providers/meta-whatsapp'
export { createTwilioWhatsAppProvider } from './providers/twilio-whatsapp'
export { createTwilioSMSProvider } from './providers/twilio-sms'
export type {
  DispatchFailureClassification,
  DispatchFailureInfo,
  ObservabilityEvent,
} from './reliability'
export {
  buildDeliveryFingerprint,
  classifyDispatchFailure,
  createObservabilityEvent,
} from './reliability'
export { buildCommonEventContext, buildTemplateContext, getContextValue } from './templates/context'
export { renderTemplate } from './templates/render'
export { resolveTemplate, resolveTemplateSync } from './templates/resolve'
export {
  compile as compileTemplate,
  render as renderCompiledTemplate,
  renderTemplate as renderEngineTemplate,
} from './templates/engine'
export type { CompiledTemplate, CompileOptions, TemplateNode } from './templates/engine'
export { defineTrigger } from './triggers'
