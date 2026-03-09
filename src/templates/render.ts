import type { NotificationTemplateContext, NotificationTemplateRenderer } from '../types'

const stringifyValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'undefined') return ''
  if (typeof value === 'function' || typeof value === 'symbol') return String(value)

  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return '[unserializable]'
  }
}

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
    html: `<p>${escapeHtml(rendered)}</p>`,
    meta: {
      template,
    },
  }
}
