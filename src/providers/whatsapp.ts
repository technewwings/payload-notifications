import type { NormalizedNotificationsPluginOptions, WhatsAppProviderAdapter } from '../types'
import { createMetaWhatsAppProvider } from './meta-whatsapp'
import { createTwilioWhatsAppProvider } from './twilio-whatsapp'

export const createWhatsAppProvider = (
  options: NormalizedNotificationsPluginOptions,
): WhatsAppProviderAdapter => {
  const provider = options.providers.whatsapp?.provider

  if (provider === 'meta') {
    return createMetaWhatsAppProvider(options)
  }

  if (provider === 'twilio') {
    return createTwilioWhatsAppProvider(options)
  }

  throw new Error(
    `Unsupported WhatsApp provider: ${String(provider)}. Supported providers: meta, twilio`,
  )
}
