import type { Payload } from 'payload'
import type { NotificationSendInput, NotificationsPluginOptions } from '../types'
import { sendEmailNotification } from '../channels/email'
import { sendInAppNotification } from '../channels/inapp'
import { sendSMSNotification } from '../channels/sms'
import { sendWhatsAppNotification } from '../channels/whatsapp'

export const sendNotification = async ({
  payload,
  input,
  options,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NotificationsPluginOptions
}) => {
  switch (input.channel) {
    case 'email':
      return sendEmailNotification({ payload, input, options })
    case 'whatsapp':
      return sendWhatsAppNotification({ payload, input, options })
    case 'sms':
      return sendSMSNotification({ payload, input, options })
    case 'inapp':
      return sendInAppNotification({ payload, input, options })
    default:
      throw new Error(`Unsupported notification channel: ${input.channel}`)
  }
}
