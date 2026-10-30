/** Date display follows the account preference and the browser's local timezone. */
export type MediaDetailDateFormat = "YYYY_MM_DD" | "MM_DD_YYYY" | "DD_MM_YYYY"

export function formatMediaDetailDate(
  value: string,
  format: MediaDetailDateFormat = "YYYY_MM_DD",
): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return "-"
  const year = String(date.getFullYear()).padStart(4, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const calendar =
    format === "MM_DD_YYYY"
      ? `${month}/${day}/${year}`
      : format === "DD_MM_YYYY"
        ? `${day}/${month}/${year}`
        : `${year}/${month}/${day}`
  return `${calendar} ${hours}:${minutes}`
}
