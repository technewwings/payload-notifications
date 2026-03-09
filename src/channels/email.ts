import type { Payload } from 'payload'
import type {
  NormalizedNotificationsPluginOptions,
  NotificationDispatchResult,
  NotificationSendInput,
} from '../types'

export const sendEmailNotification = async ({
  payload,
  input,
  options,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NormalizedNotificationsPluginOptions
}): Promise<NotificationDispatchResult> => {
  const user = await payload.findByID({
    collection: options.userCollectionSlug,
    id: input.userId,
  })

  if (!user?.email) {
    await payload.create({
      collection: options.collections.logs,
      data: {
        user: input.userId,
        event: input.event,
        channel: 'email',
        status: 'skipped',
        template: input.template,
        error: 'User email not found',
      },
    })

    return {
      channel: 'email',
      status: 'skipped',
      reason: 'User email not found',
    }
  }

  await payload.sendEmail({
    to: user.email,
    subject: `Notification: ${input.event}`,
    html: `<p>Template ${input.template} rendered for ${input.event}</p>`,
  })

  await payload.create({
    collection: options.collections.logs,
    data: {
      user: input.userId,
      event: input.event,
      channel: 'email',
      status: 'sent',
      template: input.template,
    },
  })

  return {
    channel: 'email',
    status: 'sent',
  }
}
