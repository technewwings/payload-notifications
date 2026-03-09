import type { Payload } from 'payload'
import type { NotificationSendInput, NotificationsPluginOptions } from '../types'

export const sendWhatsAppNotification = async ({
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
      channel: 'whatsapp',
      status: 'queued',
      template: input.template,
      error: 'WhatsApp provider integration scaffolded but not yet implemented',
    },
  })
}
