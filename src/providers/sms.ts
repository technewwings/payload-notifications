import type { NormalizedNotificationsPluginOptions, SMSProviderAdapter } from '../types'
import { createTwilioSMSProvider } from './twilio-sms'

export const createSMSProvider = (
  options: NormalizedNotificationsPluginOptions,
): SMSProviderAdapter => {
  const provider = options.providers.sms?.provider

  if (provider === 'twilio') {
    return createTwilioSMSProvider(options)
  }

  throw new Error(`Unsupported SMS provider: ${String(provider)}. Supported providers: twilio`)
}
