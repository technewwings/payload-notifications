import type { Payload } from 'payload'
import type {
  NormalizedNotificationsPluginOptions,
  NotificationDispatchResult,
  NotificationSendInput,
} from '../types'

export const sendInAppNotification = async ({
  payload,
  input,
  options,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NormalizedNotificationsPluginOptions
}): Promise<NotificationDispatchResult> => {
  await payload.create({
    collection: options.collections.notifications,
    data: {
      title: `Notification for ${input.event}`,
      message: `Template ${input.template} stored for ${input.event}`,
      recipient: input.userId,
      meta: {
        data: input.eventPayload,
      },
    },
  })

  await payload.create({
    collection: options.collections.logs,
    data: {
      user: input.userId,
      event: input.event,
      channel: 'inapp',
      status: 'stored',
      template: input.template,
    },
  })

  return {
    channel: 'inapp',
    status: 'stored',
  }
}
