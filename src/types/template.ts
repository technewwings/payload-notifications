export type Channel = 'email' | 'sms' | 'whatsapp' | 'inapp';

export interface TemplateRenderInput {
  slug: string;
  channel: Channel;
  data: Record<string, any>;
}

export interface TemplateContent {
  subject?: string;
  html?: string;
  text?: string;
  body?: string;
  title?: string;
}
