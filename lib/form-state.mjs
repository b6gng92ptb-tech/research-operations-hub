import { requestSchema } from './validation.mjs';

export const emptyRequestDraft = Object.freeze({
  title: '',
  description: '',
  category: 'research',
  priority: 'medium',
});

export function validateRequestDraft(value) {
  const result = requestSchema.safeParse(value);
  if (result.success) return { success: true, data: result.data, fieldErrors: {} };

  const fieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { success: false, fieldErrors };
}

export function hasUnsavedRequestDraft(value) {
  return Object.keys(emptyRequestDraft).some((key) => value[key] !== emptyRequestDraft[key]);
}
