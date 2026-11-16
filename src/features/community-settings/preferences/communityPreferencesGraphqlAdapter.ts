import type { UpdateCommunitySettingsInput } from "@/infrastructure/graphql/generated"
import type { CommunityPreferencesPatch, CommunityPreferencesValues } from "./communityPreferences"

/** GraphQLの設定値から、自動保存対象のPreferencesのみを抽出する。 */
export const fromGraphqlCommunityPreferences = (
  settings: Pick<CommunityPreferencesValues, "accentColor">,
): CommunityPreferencesValues => ({ accentColor: settings.accentColor })

/** Community IDを固定し、Aliasを自動保存対象に含めない。 */
export const toGraphqlCommunityPreferencesPatch = (
  communityId: string,
  patch: CommunityPreferencesPatch,
): UpdateCommunitySettingsInput => ({ communityId, accentColor: patch.accentColor })
