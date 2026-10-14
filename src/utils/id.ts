/**
 * Generates a collision-resistant unique identifier.
 * Uses crypto.randomUUID() when available, with a robust fallback
 * for insecure contexts (HTTP / LAN testing) or older mobile WebViews.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to fallback
    }
  }

  const timestamp = Date.now().toString(36);
  const randomSection = Math.random().toString(36).substring(2, 10);
  const randomSection2 = Math.random().toString(36).substring(2, 6);
  return `tiffin-${timestamp}-${randomSection}-${randomSection2}`;
}
