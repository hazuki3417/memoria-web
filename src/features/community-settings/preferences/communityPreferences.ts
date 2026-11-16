/** 自動保存するCommunity環境設定の確定値。明示保存するAliasは含めない。 */
export type CommunityPreferencesValues = {
  accentColor: string
}

/** 現在の自動保存対象はAccent Colorのみ。空のPatchは保存しない。 */
export type CommunityPreferencesPatch = Pick<CommunityPreferencesValues, "accentColor">

/** 入力途中のHEXを保持できるPreferencesのDraft。 */
export type CommunityPreferencesDraft = {
  accentColor: string
}

/** Accent固有の入力制約を判定する。 */
export const isCommunityAccentColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)
