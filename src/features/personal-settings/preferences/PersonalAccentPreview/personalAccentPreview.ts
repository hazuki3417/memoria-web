/** 画面の有効Accent選択だけを即時表示する。離脱後はQueryの値へ戻す。 */
export function resolvePersonalAccent(
  persisted: string | undefined,
  preview: string | null,
): string | undefined {
  return preview && /^#[0-9A-Fa-f]{6}$/.test(preview)
    ? preview.toUpperCase()
    : persisted
}
