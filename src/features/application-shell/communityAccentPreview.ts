export type CommunityAccentPreview = {
  communityId: string
  color: string
  owner: number
} | null

/** Preview changes only the active Community presentation, never the confirmed value. */
export const resolveCommunityAccent = (
  communityId: string | null | undefined,
  confirmed: string,
  preview: CommunityAccentPreview,
): string => {
  return preview && preview.communityId === communityId
    ? preview.color
    : confirmed
}

/** A late response or stale cleanup cannot dismiss another owner's preview. */
export const releaseCommunityAccentPreview = (
  current: CommunityAccentPreview,
  communityId: string,
  owner: number,
): CommunityAccentPreview => {
  return current?.communityId === communityId && current.owner === owner
    ? null
    : current
}
