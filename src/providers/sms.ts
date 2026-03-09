import type {
  ChannelProviderResult,
  NormalizedNotificationsPluginOptions,
  SMSProviderAdapter,
  SMSProviderSendInput,
} from '../types'

export const createSMSProvider = (
  options: NormalizedNotificationsPluginOptions,
): SMSProviderAdapter => {
  return {
    send: async (input: SMSProviderSendInput): Promise<ChannelProviderResult> => {
      const provider = options.providers.sms?.provider || 'twilio'

      return {
        provider,
        messageId: `${provider}-sms-${input.context.event}`,
        response: {
          to: input.to,
          template: input.template,
        },
      }
    },
  }
}
