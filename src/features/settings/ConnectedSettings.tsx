"use client"

import { Text } from "@mantine/core"
import { Settings } from "./Settings"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"
import {
  CurrentUserDocument,
  DateFormat,
  FileSizeUnit,
  MediaThumbnailSize,
  type UpdateUserPreferencesInput,
  useCurrentUserQuery,
  useSaveUserPreferencesMutation,
  useUpdateMemoriaUserProfileMutation,
} from "@/infrastructure/graphql/generated"

const dates = { YYYY_MM_DD: DateFormat.YyyyMmDd, MM_DD_YYYY: DateFormat.MmDdYyyy, DD_MM_YYYY: DateFormat.DdMmYyyy }
const sizes = { DECIMAL: FileSizeUnit.Decimal, BINARY: FileSizeUnit.Binary }
const thumbnails = { SMALL: MediaThumbnailSize.Small, MEDIUM: MediaThumbnailSize.Medium, LARGE: MediaThumbnailSize.Large }

export function ConnectedSettings({ section }: { section: "profile" | "preferences" }) {
  const { data, loading, error } = useCurrentUserQuery()
  const [updateProfile] = useUpdateMemoriaUserProfileMutation()
  const [updatePreferences] = useSaveUserPreferencesMutation()
  if (loading && !data) return <Text>設定を読み込み中...</Text>
  if (error || !data?.me) return <Text c="red">設定を取得できませんでした。再読み込みしてください。</Text>

  const preferences = data.me.preferences as UserPreferences
  return <Settings
    key={section}
    section={section}
    profileNickname={data.me.profile.nickname}
    initialPreferences={preferences}
    saveProfile={async (nickname) => {
      await updateProfile({
        variables: { input: { nickname } },
        refetchQueries: [CurrentUserDocument],
        awaitRefetchQueries: true,
      })
    }}
    savePreferences={async (patch: UserPreferencesPatch) => {
      const input: UpdateUserPreferencesInput = {
        ...patch,
        dateFormat: patch.dateFormat ? dates[patch.dateFormat] : undefined,
        fileSizeUnit: patch.fileSizeUnit ? sizes[patch.fileSizeUnit] : undefined,
        mediaThumbnailSize: patch.mediaThumbnailSize ? thumbnails[patch.mediaThumbnailSize] : undefined,
      }
      const result = await updatePreferences({
        variables: { input },
        refetchQueries: [CurrentUserDocument],
        awaitRefetchQueries: true,
      })
      if (!result.data?.updateUserPreferences.preferences) throw new Error("Preferences update unconfirmed")
      return result.data.updateUserPreferences.preferences as UserPreferences
    }}
  />
}
