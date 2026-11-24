/** Parse JSON with a bounded request body. Reject oversized and malformed payloads. */
export async function readJsonBody(request, maxBytes = 16_384) {
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > maxBytes)) {
    return { ok: false, status: 413, error: 'Payload too large' };
  }
  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400, error: 'JSON body required' };
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: 'Payload too large' };
      }
      chunks.push(value);
    }
    const merged = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(merged));
    if (data === null || typeof data !== 'object' || Array.isArray(data)) throw Error('Invalid object');
    return { ok: true, data };
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON object' };
  }
}
