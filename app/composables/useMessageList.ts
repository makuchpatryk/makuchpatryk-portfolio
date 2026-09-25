/** Resolves an array message (e.g. `experience.current.bullets`) into plain strings. */
export function useMessageList() {
  const { tm, rt } = useI18n()
  return (key: string): string[] => {
    const raw = tm(key) as unknown
    return Array.isArray(raw) ? raw.map(item => rt(item as never)) : []
  }
}
