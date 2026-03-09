import type { Config } from 'payload'
import type { NotificationsPluginOptions } from './types'

export const payloadNotifications = (options: NotificationsPluginOptions) => {
  return (config: Config): Config => {
    return {
      ...config,
      // Plugin implementation will go here
    }
  }
}
