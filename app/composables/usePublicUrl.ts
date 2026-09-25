import { withBase } from 'ufo'

/** URL for a file in `public/` that respects `app.baseURL` (raw <video src>, cv.pdf href, ...). */
export function usePublicUrl() {
  const baseURL = useRuntimeConfig().app.baseURL
  return (path: string) => withBase(path.replace(/^\/+/, ''), baseURL)
}
