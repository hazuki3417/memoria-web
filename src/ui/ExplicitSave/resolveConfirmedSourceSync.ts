/**
 * Decide whether a newly received source value may advance a manual Form's
 * confirmed baseline, and whether the Form may reset its untouched Draft.
 *
 * Callers own RHF, the baseline, the source echo marker, and the actual reset.
 * A stale Query echo must not roll back a confirmed save.
 */
export function resolveConfirmedSourceSync<T>({
  source,
  expectedEcho,
  baseline,
  draft,
  isUnknown,
  canResetDraft,
}: {
  source: T
  expectedEcho: T | null
  baseline: T
  draft: T
  isUnknown: boolean
  canResetDraft: boolean
}): { adopt: false } | { adopt: true; resetDraft: boolean } {
  if (isUnknown) return { adopt: false }
  if (expectedEcho !== null && !Object.is(source, expectedEcho))
    return { adopt: false }

  return {
    adopt: true,
    resetDraft: Object.is(draft, baseline) && canResetDraft,
  }
}
