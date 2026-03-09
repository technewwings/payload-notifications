import type {
  ChannelProviderResult,
  NormalizedNotificationsPluginOptions,
  WhatsAppProviderAdapter,
  WhatsAppProviderSendInput,
} from '../types'

export const createWhatsAppProvider = (
  options: NormalizedNotificationsPluginOptions,
): WhatsAppProviderAdapter => {
  return {
    send: async (input: WhatsAppProviderSendInput): Promise<ChannelProviderResult> => {
      const provider = options.providers.whatsapp?.provider || 'twilio'

      return {
        provider,
        messageId: `${provider}-whatsapp-${input.context.event}`,
        response: {
          to: input.to,
          template: input.template,
        },
      }
    },
  }
}
