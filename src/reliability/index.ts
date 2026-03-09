import type { NotificationDispatchResult, NotificationSendInput } from '../types'

export type DispatchFailureClassification = 'retriable' | 'terminal'

export type DispatchFailureInfo = {
  classification: DispatchFailureClassification
  message: string
}

export type ObservabilityEvent = {
  type: 'notification.dispatch'
  channel: NotificationSendInput['channel']
  event: string
  userId: string
  status: NotificationDispatchResult['status']
  reason?: string
  provider?: string
  providerMessageId?: string
  idempotencyKey?: string
}

export const buildDeliveryFingerprint = (input: NotificationSendInput): string => {
  const parts = [
    input.userId,
    input.channel,
    input.event,
    input.template,
    input.idempotencyKey || 'no-idempotency-key',
  ]

  return parts.join('::')
}

export const classifyDispatchFailure = (error: unknown): DispatchFailureInfo => {
  const message = error instanceof Error ? error.message : 'Unknown dispatch error'
  const normalized = message.toLowerCase()

  if (
    normalized.includes('timeout') ||
    normalized.includes('temporar') ||
    normalized.includes('rate limit') ||
    normalized.includes('unavailable')
  ) {
    return {
      classification: 'retriable',
      message,
    }
  }

  return {
    classification: 'terminal',
    message,
  }
}

export const createObservabilityEvent = ({
  input,
  result,
}: {
  input: NotificationSendInput
  result: NotificationDispatchResult
}): ObservabilityEvent => ({
  type: 'notification.dispatch',
  channel: input.channel,
  event: input.event,
  userId: input.userId,
  status: result.status,
  reason: result.reason,
  provider: result.provider,
  providerMessageId: result.providerMessageId,
  idempotencyKey: input.idempotencyKey,
})
