export const createFormDefaults = <T extends Record<string, unknown>>(
  defaults: T,
) => {
  return (partial?: Partial<T>): T => ({
    ...defaults,
    ...partial,
  })
}
