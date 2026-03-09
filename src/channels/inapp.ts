import type { Payload } from 'payload'
import type { NotificationSendInput, NotificationsPluginOptions } from '../types'

export const sendInAppNotification = async ({
  payload,
  input,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NotificationsPluginOptions
}) => {
  await payload.create({
    collection: 'notifications',
    data: {
      title: `Notification for ${input.event}`,
      message: `Template ${input.template} stored for ${input.event}`,
      recipient: input.userId,
      meta: input.eventPayload,
    },
  })

  await payload.create({
    collection: 'notification-logs',
    data: {
      user: input.userId,
      event: input.event,
      channel: 'inapp',
      status: 'stored',
      template: input.template,
    },
  })
}
