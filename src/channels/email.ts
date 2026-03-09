import type { Payload } from 'payload'
import type { NotificationSendInput, NotificationsPluginOptions } from '../types'

export const sendEmailNotification = async ({
  payload,
  input,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NotificationsPluginOptions
}) => {
  const user = await payload.findByID({
    collection: 'users',
    id: input.userId,
  })

  if (!user?.email) {
    await payload.create({
      collection: 'notification-logs',
      data: {
        user: input.userId,
        event: input.event,
        channel: 'email',
        status: 'skipped',
        template: input.template,
        error: 'User email not found',
      },
    })
    return
  }

  await payload.sendEmail({
    to: user.email,
    subject: `Notification: ${input.event}`,
    html: `<p>Template ${input.template} rendered for ${input.event}</p>`,
  })

  await payload.create({
    collection: 'notification-logs',
    data: {
      user: input.userId,
      event: input.event,
      channel: 'email',
      status: 'sent',
      template: input.template,
    },
  })
}
