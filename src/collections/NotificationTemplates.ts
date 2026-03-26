import { CollectionConfig } from 'payload/types';

export const NotificationTemplates: CollectionConfig = {
  slug: 'notification-templates',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'channels',
      type: 'select',
      hasMany: true,
      options: ['email', 'sms', 'whatsapp', 'inapp'],
    },
    {
      name: 'email',
      type: 'group',
      fields: [
        { name: 'subject', type: 'text' },
        { name: 'html', type: 'textarea' },
        { name: 'text', type: 'textarea' },
      ],
    },
    {
      name: 'sms',
      type: 'group',
      fields: [{ name: 'body', type: 'textarea' }],
    },
    {
      name: 'whatsapp',
      type: 'group',
      fields: [{ name: 'body', type: 'textarea' }],
    },
    {
      name: 'inapp',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
    { name: 'variables', type: 'json' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: ['draft', 'active'],
    },
  ],
};
