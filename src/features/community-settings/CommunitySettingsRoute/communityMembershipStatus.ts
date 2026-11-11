/** A failed or unfinished membership lookup must never be treated as confirmed non-membership. */
export type CommunityMembershipStatus = "loading" | "error" | "not-member" | "ready"

export function getCommunityMembershipStatus({
  loading,
  failed,
  hasData,
  isMember,
}: {
  loading: boolean
  failed: boolean
  hasData: boolean
  isMember: boolean
}): CommunityMembershipStatus {
  if (loading) return "loading"
  if (failed || !hasData) return "error"
  return isMember ? "ready" : "not-member"
}
