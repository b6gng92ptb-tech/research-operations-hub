/** Validate opaque external webhook identifiers before persistence. */
export function validEventId(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 100 && /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(value);
}

/** Do not expose a raw-token entry field in a publicly hosted showcase. */
export function liveModeEnabled(value) { return value === 'true'; }
