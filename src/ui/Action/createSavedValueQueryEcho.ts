/**
 * 明示保存後、Queryに遅れて現れた保存前の値だけを無視する。
 * 保存前の値とは異なる新しい観測値は、保存後でも無期限に遮断しない。
 * Draft保護・Idle判定・Form resetは各Featureが所有する。
 */
export const createSavedValueQueryEcho = <T,>(initial: T) => {
  let observed = initial
  let pending: { previous: T; confirmed: T } | null = null

  return {
    adopt: (confirmed: T) => {
      pending = Object.is(confirmed, observed)
        ? null
        : { previous: observed, confirmed }
    },
    observe: (value: T): boolean => {
      if (Object.is(value, observed)) return false
      observed = value
      if (pending) {
        const previous = pending.previous
        if (Object.is(value, previous)) return false
        pending = null
      }
      return true
    },
  }
}
