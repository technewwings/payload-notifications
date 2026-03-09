import type {
  NotificationChannel,
  NotificationEventPayload,
  NotificationTemplateContext,
} from '../types'

const pickNestedValue = (value: unknown, path: string): unknown => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined

    if (Array.isArray(current)) {
      const index = Number(key)
      return Number.isNaN(index) ? undefined : current[index]
    }

    if (typeof current !== 'object') return undefined

    return (current as Record<string, unknown>)[key]
  }, value)
}

export const buildTemplateContext = ({
  event,
  userId,
  payload,
}: {
  event: string
  userId: string
  payload?: NotificationEventPayload
}): NotificationTemplateContext => ({
  event,
  userId,
  payload,
})

export const buildCommonEventContext = ({
  event,
  userId,
  payload,
}: {
  event: string
  userId: string
  payload?: NotificationEventPayload
}): NotificationTemplateContext => {
  return buildTemplateContext({ event, userId, payload })
}

export const getContextValue = (context: NotificationTemplateContext, key: string): unknown => {
  if (key === 'event') return context.event
  if (key === 'userId') return context.userId
  if (key.startsWith('payload.')) {
    return pickNestedValue(context.payload, key.replace('payload.', ''))
  }

  return undefined
}

export const getDefaultTemplateRegistry = (): Record<
  string,
  Partial<Record<NotificationChannel, string | { subject?: string; title?: string; body: string }>>
> => ({
  'order.paid': {
    email: {
      subject: 'Order {{ payload.orderId }} paid',
      body: 'Hi {{ userId }}, your order {{ payload.orderId }} has been paid successfully.',
    },
    sms: 'Order {{ payload.orderId }} has been paid.',
    whatsapp: 'Your order {{ payload.orderId }} has been paid.',
    inapp: {
      title: 'Order paid',
      body: 'Order {{ payload.orderId }} is now marked as paid.',
    },
  },
  'order.shipped': {
    email: {
      subject: 'Order {{ payload.orderId }} shipped',
      body: 'Hi {{ userId }}, your order {{ payload.orderId }} has shipped.',
    },
    sms: 'Order {{ payload.orderId }} shipped with tracking {{ payload.trackingNumber }}.',
    whatsapp: 'Order {{ payload.orderId }} shipped. Tracking: {{ payload.trackingNumber }}.',
    inapp: {
      title: 'Order shipped',
      body: 'Order {{ payload.orderId }} has shipped.',
    },
  },
  'auth.magic-link': {
    email: {
      subject: 'Your sign-in link',
      body: 'Use this secure sign-in link: {{ payload.url }}',
    },
    sms: 'Use this sign-in link: {{ payload.url }}',
    whatsapp: 'Your sign-in link: {{ payload.url }}',
    inapp: {
      title: 'Sign-in link ready',
      body: 'A secure sign-in link was generated for your account.',
    },
  },
})
