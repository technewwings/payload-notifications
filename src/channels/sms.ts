import type { Payload } from 'payload'
import type { NotificationSendInput, NotificationsPluginOptions } from '../types'

export const sendSMSNotification = async ({
  payload,
  input,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NotificationsPluginOptions
}) => {
  await payload.create({
    collection: 'notification-logs',
    data: {
      user: input.userId,
      event: input.event,
      channel: 'sms',
      status: 'queued',
      template: input.template,
      error: 'SMS provider integration scaffolded but not yet implemented',
    },
  })
}
