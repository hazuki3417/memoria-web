const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" })

/** Count what the user perceives as characters, including combined emoji. */
export function countGroupNameGraphemes(value: string): number {
  return Array.from(segmenter.segment(value)).length
}

/** Whether a new input value fits the existing Group name field limit. */
export function canEnterGroupName(value: string): boolean {
  return countGroupNameGraphemes(value) <= 100
}

/** Validate raw input before trim so forbidden characters cannot disappear. */
export function validGroupName(value: string): boolean {
  if (/[\p{Cc}\p{Zl}\p{Zp}]/u.test(value)) return false
  const trimmed = value.trim()
  const length = countGroupNameGraphemes(trimmed)
  return length > 0 && length <= 100
}
