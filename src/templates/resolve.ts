import type {
  NormalizedNotificationsPluginOptions,
  NotificationChannel,
  NotificationTemplateDefinition,
  NotificationTemplateResolution,
  NotificationTemplateResolver,
} from '../types'
import { getDefaultTemplateRegistry } from './context'

const normalizeDefinition = (
  template: string | NotificationTemplateDefinition,
): NotificationTemplateDefinition => {
  if (typeof template === 'string') {
    return { body: template }
  }

  return template
}

export const resolveTemplate: NotificationTemplateResolver = ({
  event,
  channel,
  templateKey,
  options,
}): NotificationTemplateResolution => {
  const registry = {
    ...getDefaultTemplateRegistry(),
    ...options.templates.registry,
  }

  const resolvedKey = templateKey || event
  const eventTemplates = registry[resolvedKey]

  if (!eventTemplates) {
    throw new Error(`Template set not found for key: ${resolvedKey}`)
  }

  const channelTemplate = eventTemplates[channel as NotificationChannel]

  if (!channelTemplate) {
    throw new Error(`Template for channel ${channel} not found in template set: ${resolvedKey}`)
  }

  return {
    event,
    channel,
    templateKey: resolvedKey,
    definition: normalizeDefinition(channelTemplate),
  }
}
