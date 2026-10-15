/**
 * URL for a file in `public/` that respects `app.baseURL` (raw <video src>, cv.pdf href, ...).
 * Always root-anchored: a relative URL would resolve against nested routes (/projects/<slug>/).
 */
export function usePublicUrl() {
  const baseURL = useRuntimeConfig().app.baseURL
  return (path: string) => baseURL + path.replace(/^\/+/, '')
}
