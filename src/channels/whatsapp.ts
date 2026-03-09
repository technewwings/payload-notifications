import type { Payload } from 'payload'
import type {
  NormalizedNotificationsPluginOptions,
  NotificationDispatchResult,
  NotificationSendInput,
} from '../types'

export const sendWhatsAppNotification = async ({
  payload,
  input,
  options,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NormalizedNotificationsPluginOptions
}): Promise<NotificationDispatchResult> => {
  await payload.create({
    collection: options.collections.logs,
    data: {
      user: input.userId,
      event: input.event,
      channel: 'whatsapp',
      status: 'queued',
      template: input.template,
      error: 'WhatsApp provider integration scaffolded but not yet implemented',
    },
  })

  return {
    channel: 'whatsapp',
    status: 'queued',
    reason: 'WhatsApp provider integration scaffolded but not yet implemented',
  }
}
