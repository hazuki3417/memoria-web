export type ReviewState = "default" | "empty" | "failure" | "retrying"
export type CommunityScenario =
  | "mixed-memberships"
  | "no-communities"
  | "member-only"
  | "administrator-with-others-only"
  | "withdrawal-mixed"
  | "last-administrator"
  | "last-administrator-no-candidate"
  | "multiple-last-administrators"
export type RetryOutcome = "success" | "failure"
export type Decision = {
  choice: "keep" | "delete" | null
  successors: string[]
}
type CommunityFixture = {
  id: string
  name: string
  members: number
  media: number
  relation: "member" | "administrator-with-others" | "last-administrator"
  candidates: { value: string; label: string }[]
}
const resolutionCommunities: CommunityFixture[] = [
  {
    id: "family",
    name: "家族のアルバム",
    members: 5,
    media: 128,
    relation: "last-administrator",
    candidates: [
      { value: "a", label: "山田 花子" },
      { value: "b", label: "山田 太郎" },
    ],
  },
  {
    id: "travel",
    name: "旅行の思い出",
    members: 1,
    media: 42,
    relation: "last-administrator",
    candidates: [],
  },
  {
    id: "friends",
    name: "友人との記録",
    members: 4,
    media: 36,
    relation: "last-administrator",
    candidates: [{ value: "c", label: "佐藤 葵" }],
  },
]

const withdrawalCommunities: CommunityFixture[] = [
  {
    id: "club",
    name: "写真クラブ",
    members: 8,
    media: 64,
    relation: "member",
    candidates: [],
  },
  {
    id: "school",
    name: "同窓会",
    members: 12,
    media: 91,
    relation: "administrator-with-others",
    candidates: [],
  },
]
export const communitiesForScenario = (
  scenario: CommunityScenario,
): CommunityFixture[] => {
  if (scenario === "no-communities") return []
  if (scenario === "member-only") return [withdrawalCommunities[0]]
  if (scenario === "administrator-with-others-only")
    return [withdrawalCommunities[1]]
  if (scenario === "withdrawal-mixed") return withdrawalCommunities
  if (scenario === "last-administrator") return [resolutionCommunities[0]]
  if (scenario === "last-administrator-no-candidate")
    return [resolutionCommunities[1]]
  if (scenario === "multiple-last-administrators") return resolutionCommunities
  return [resolutionCommunities[0], ...withdrawalCommunities]
}
export const labels = [
  "個人データへの影響",
  "Communityへの対応",
  "Communityへの影響",
  "最終確認",
]
