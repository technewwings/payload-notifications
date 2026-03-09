import type { CollectionConfig } from 'payload'

export const NotificationsCollection = (
  userCollectionSlug = 'users',
  slug = 'notifications',
): CollectionConfig => ({
  slug,
  labels: {
    singular: 'Notification',
    plural: 'Notifications',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'recipient', 'isRead', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: userCollectionSlug,
      required: true,
      index: true,
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'readAt',
      type: 'date',
    },
    {
      name: 'meta',
      type: 'json',
    },
  ],
  timestamps: true,
})
