import { applyTemplate } from '../templates/applyTemplate';

/**
 * Wrapper to integrate templates into notification pipeline
 */
export const useTemplate = async ({
  payload,
  templateSlug,
  channel,
  data,
  fallbackContent,
}) => {
  if (!templateSlug) return fallbackContent;

  const rendered = await applyTemplate({
    payload,
    slug: templateSlug,
    channel,
    data,
  });

  return rendered || fallbackContent;
};
