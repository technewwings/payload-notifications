import { Payload } from 'payload';

export const resolveTemplate = async ({
  payload,
  slug,
  channel,
}: {
  payload: Payload;
  slug: string;
  channel: string;
}) => {
  // 1. DB lookup
  const res = await payload.find({
    collection: 'notification-templates',
    where: {
      slug: { equals: slug },
      status: { equals: 'active' },
    },
    limit: 1,
  });

  if (res.docs?.length) {
    const tpl = res.docs[0] as any;
    return tpl[channel] || null;
  }

  // 2. fallback (legacy)
  try {
    const { resolveFromRegistry } = await import('./resolve');
    return resolveFromRegistry(slug, channel);
  } catch (e) {
    return null;
  }
};
