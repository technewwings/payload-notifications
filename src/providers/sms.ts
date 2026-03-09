import type {
  ChannelProviderResult,
  NormalizedNotificationsPluginOptions,
  SMSProviderAdapter,
  SMSProviderSendInput,
} from '../types'

const createMessageId = (provider: string, channel: string, event: string): string => {
  return `${provider}-${channel}-${event}-${Date.now()}`
}

export const createSMSProvider = (
  options: NormalizedNotificationsPluginOptions,
): SMSProviderAdapter => {
  return {
    send: async (input: SMSProviderSendInput): Promise<ChannelProviderResult> => {
      const provider = options.providers.sms?.provider || 'twilio'

      return {
        provider,
        messageId: createMessageId(provider, 'sms', input.context.event),
        response: {
          to: input.to,
          template: input.template,
        },
      }
    },
  }
}
