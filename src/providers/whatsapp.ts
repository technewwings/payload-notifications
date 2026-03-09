import type {
  ChannelProviderResult,
  NormalizedNotificationsPluginOptions,
  WhatsAppProviderAdapter,
  WhatsAppProviderSendInput,
} from '../types'

const createMessageId = (provider: string, channel: string, event: string): string => {
  return `${provider}-${channel}-${event}-${Date.now()}`
}

export const createWhatsAppProvider = (
  options: NormalizedNotificationsPluginOptions,
): WhatsAppProviderAdapter => {
  return {
    send: async (input: WhatsAppProviderSendInput): Promise<ChannelProviderResult> => {
      const provider = options.providers.whatsapp?.provider || 'twilio'

      return {
        provider,
        messageId: createMessageId(provider, 'whatsapp', input.context.event),
        response: {
          to: input.to,
          template: input.template,
        },
      }
    },
  }
}
