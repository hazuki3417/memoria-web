import type { CommunityMember } from "../members"

/** Story/Prototypeで使用する参加者。Production Viewの既定値にはしない。 */
export const previewCommunityMembers: CommunityMember[] = [
  { id: "self", name: "ユーザー", role: "admin", isSelf: true },
  { id: "m1", name: "山田 花子", role: "admin" },
  { id: "m2", name: "佐藤 葵", role: "member" },
  { id: "m3", name: "鈴木 太郎", role: "member" },
]
