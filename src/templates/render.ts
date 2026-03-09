import type { NotificationTemplateContext, NotificationTemplateRenderer } from '../types'

const stringifyValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

const replaceTokens = (template: string, context: NotificationTemplateContext): string => {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, rawKey: string) => {
    const key = rawKey.trim()

    if (key === 'event') return context.event
    if (key === 'userId') return context.userId

    if (key.startsWith('payload.')) {
      const payloadKey = key.replace('payload.', '')
      return stringifyValue(context.payload?.[payloadKey] ?? '')
    }

    return ''
  })
}

export const renderTemplate: NotificationTemplateRenderer = async (template, context) => {
  const rendered = replaceTokens(template, context)

  return {
    subject: `Notification: ${context.event}`,
    text: rendered,
    html: `<p>${rendered}</p>`,
    meta: {
      template,
    },
  }
}
