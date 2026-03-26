export const renderTemplate = (template: string, data: Record<string, any>) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return data[key.trim()] ?? '';
  });
};
