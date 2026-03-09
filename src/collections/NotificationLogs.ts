import type { CollectionConfig } from 'payload'

export const NotificationLogsCollection = (
  userCollectionSlug = 'users',
  slug = 'notification-logs',
): CollectionConfig => ({
  slug,
  labels: {
    singular: 'Notification Log',
    plural: 'Notification Logs',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'event',
    defaultColumns: ['event', 'channel', 'status', 'user', 'createdAt'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: userCollectionSlug,
      index: true,
    },
    {
      name: 'event',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'channel',
      type: 'select',
      required: true,
      options: ['email', 'whatsapp', 'sms', 'inapp', 'push'],
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: ['queued', 'sent', 'stored', 'failed', 'skipped'],
      index: true,
    },
    {
      name: 'template',
      type: 'text',
    },
    {
      name: 'error',
      type: 'textarea',
    },
    {
      name: 'providerResponse',
      type: 'json',
    },
  ],
  timestamps: true,
})
