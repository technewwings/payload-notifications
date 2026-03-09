import type { Payload } from 'payload'
import type {
  NormalizedNotificationsPluginOptions,
  NotificationDispatchResult,
  NotificationSendInput,
} from '../types'
import { sendEmailNotification } from '../channels/email'
import { sendInAppNotification } from '../channels/inapp'
import { sendSMSNotification } from '../channels/sms'
import { sendWhatsAppNotification } from '../channels/whatsapp'
import { evaluateNotificationPolicy } from '../policy/evaluatePolicy'
import { resolveTemplate } from '../templates/resolve'

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const assertNotificationSendInput = (value: unknown): NotificationSendInput => {
  if (!isObject(value)) {
    throw new Error('payload-notifications: notification send input must be an object')
  }

  if (typeof value.userId !== 'string' || !value.userId.trim()) {
    throw new Error('payload-notifications: notification send input requires a userId')
  }

  if (typeof value.channel !== 'string' || !value.channel.trim()) {
    throw new Error('payload-notifications: notification send input requires a channel')
  }

  if (typeof value.template !== 'string' || !value.template.trim()) {
    throw new Error('payload-notifications: notification send input requires a template')
  }

  if (typeof value.event !== 'string' || !value.event.trim()) {
    throw new Error('payload-notifications: notification send input requires an event')
  }

  if (value.eventPayload !== undefined && !isObject(value.eventPayload)) {
    throw new Error('payload-notifications: notification send eventPayload must be an object')
  }

  return {
    userId: value.userId,
    channel: value.channel as NotificationSendInput['channel'],
    template: value.template,
    event: value.event,
    eventPayload: value.eventPayload,
    classification:
      value.classification === 'marketing' || value.classification === 'transactional'
        ? value.classification
        : undefined,
    idempotencyKey: typeof value.idempotencyKey === 'string' ? value.idempotencyKey : undefined,
  }
}

export const queueNotificationSend = async ({
  payload,
  input,
}: {
  payload: Payload
  input: NotificationSendInput
}) => {
  const validatedInput = assertNotificationSendInput(input)

  await payload.jobs.queue({
    task: 'notification:send',
    input: validatedInput,
  })
}

export const sendNotification = async ({
  payload,
  input,
  options,
}: {
  payload: Payload
  input: NotificationSendInput
  options: NormalizedNotificationsPluginOptions
}): Promise<NotificationDispatchResult | void> => {
  const validatedInput = assertNotificationSendInput(input)
  const user = await payload.findByID({
    collection: options.userCollectionSlug,
    id: validatedInput.userId,
  })

  if (!user) {
    await payload.create({
      collection: options.collections.logs,
      data: {
        user: validatedInput.userId,
        event: validatedInput.event,
        channel: validatedInput.channel,
        status: 'failed',
        template: validatedInput.template,
        error: 'User not found',
      },
    })

    return {
      channel: validatedInput.channel,
      status: 'failed',
      reason: 'User not found',
    }
  }

  const policyDecision = await evaluateNotificationPolicy({
    user: user as Record<string, unknown>,
    input: validatedInput,
    options,
  })

  if (!policyDecision.allow) {
    await payload.create({
      collection: options.collections.logs,
      data: {
        user: validatedInput.userId,
        event: validatedInput.event,
        channel: validatedInput.channel,
        status: 'skipped',
        template: validatedInput.template,
        reason: policyDecision.reason || 'Notification blocked by policy',
      },
    })

    return {
      channel: validatedInput.channel,
      status: 'skipped',
      reason: policyDecision.reason || 'Notification blocked by policy',
    }
  }

  const resolved = resolveTemplate({
    event: validatedInput.event,
    channel: validatedInput.channel,
    templateKey: validatedInput.template,
    options,
  })

  const sendInput = {
    ...validatedInput,
    template: resolved.definition.body,
  }

  switch (validatedInput.channel) {
    case 'email':
      return sendEmailNotification({ payload, input: sendInput, options })
    case 'whatsapp':
      return sendWhatsAppNotification({ payload, input: sendInput, options })
    case 'sms':
      return sendSMSNotification({ payload, input: sendInput, options })
    case 'inapp':
      return sendInAppNotification({ payload, input: sendInput, options })
    default:
      await payload.create({
        collection: options.collections.logs,
        data: {
          user: validatedInput.userId,
          event: validatedInput.event,
          channel: 'inapp',
          status: 'failed',
          template: validatedInput.template,
          error: `Unsupported notification channel: ${validatedInput.channel}`,
        },
      })
      throw new Error(`Unsupported notification channel: ${validatedInput.channel}`)
  }
}
