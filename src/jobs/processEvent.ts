import type { Payload } from 'payload'
import type { NotificationEvent, NotificationRule, NotificationsPluginOptions } from '../types'

export const resolveRulesForEvent = (
  eventName: string,
  rules: NotificationRule[] = [],
): NotificationRule[] => {
  return rules.filter((rule) => rule.event === eventName)
}

export const processEvent = async ({
  payload,
  event,
  options,
}: {
  payload: Payload
  event: NotificationEvent
  options: NotificationsPluginOptions
}) => {
  const rules = resolveRulesForEvent(event.name, options.rules)

  for (const rule of rules) {
    const shouldRun = rule.condition ? await rule.condition(event.payload ?? {}) : true
    if (!shouldRun) continue

    for (const channel of rule.channels) {
      if (options.channels?.length && !options.channels.includes(channel)) continue

      await payload.jobs.queue({
        task: 'notification:send',
        input: {
          userId: event.userId,
          channel,
          template: rule.template,
          event: event.name,
          eventPayload: event.payload,
        },
      })
    }
  }
}
