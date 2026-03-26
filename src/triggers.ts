import type { NotificationTriggerDefinition } from './types'

/**
 * Type-safe helper for defining notification triggers (rules).
 *
 * Usage:
 * ```ts
 * const orderPaidTrigger = defineTrigger({
 *   event: 'order.paid',
 *   channels: ['email', 'inapp'],
 *   template: 'order.paid',
 *   enabled: true,
 *   condition: async (payload) => Boolean(payload.orderId),
 * })
 * ```
 */
export const defineTrigger = (
  trigger: NotificationTriggerDefinition,
): NotificationTriggerDefinition => {
  if (!trigger.event) {
    throw new Error('payload-notifications: trigger requires an event name')
  }
  if (!trigger.channels?.length) {
    throw new Error('payload-notifications: trigger requires at least one channel')
  }
  if (!trigger.template) {
    throw new Error('payload-notifications: trigger requires a template key')
  }
  return { enabled: true, ...trigger }
}
