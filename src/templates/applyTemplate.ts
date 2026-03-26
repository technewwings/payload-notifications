import { renderTemplate } from './render';
import { resolveTemplate } from './resolveTemplate';

export const applyTemplate = async ({ payload, slug, channel, data }) => {
  const tpl = await resolveTemplate({ payload, slug, channel });

  if (!tpl) return null;

  const result = {} as any;

  for (const key in tpl) {
    const value = tpl[key];
    if (typeof value === 'string') {
      result[key] = renderTemplate(value, data);
    } else {
      result[key] = value;
    }
  }

  return result;
};
