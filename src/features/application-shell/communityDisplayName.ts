/**
 * Community名を表示用に解決する。候補のidentityには常にCommunity IDを使う。
 * alias fieldがAPIに追加されるまで、既存のnameのみでも動作する。
 */
export function getCommunityDisplayName(community: {
  name: string
  mySettings?: { alias?: string | null } | null
}): string {
  return community.mySettings?.alias ?? community.name
}

const japaneseNameCollator = new Intl.Collator("ja")

/** 第2ソートキーを導入せず、表示名のみで並び替える。 */
export function sortCommunitiesByDisplayName<T extends { label: string }>(
  communities: readonly T[],
): T[] {
  return [...communities].sort((a, b) =>
    japaneseNameCollator.compare(a.label, b.label),
  )
}
